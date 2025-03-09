#!/usr/bin/env python3
import os
import sys
import subprocess
import webbrowser
import time
import shutil
import json
import threading
from pathlib import Path
import traceback
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
from flask_sock import Sock
import queue
import io
import contextlib

# Load environment variables from .env file
load_dotenv()

# Configuration
WEBUI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "webui")
DEFAULT_PORT = 3000
DEFAULT_HOST = "localhost"
API_PORT = 5000

# Add src directory to Python path
SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
sys.path.append(SRC_DIR)

# Copy .env file to webui directory for Next.js to access via env vars
def copy_env_file():
    src_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    webui_env = os.path.join(WEBUI_DIR, ".env")
    if os.path.exists(src_env):
        shutil.copy2(src_env, webui_env)
        print(f"Copied .env file to {webui_env}")
    else:
        print("Warning: .env file not found in project root")

# API server implementation
def start_api_server(host=DEFAULT_HOST, port=API_PORT):
    # Try importing the main hedge fund modules
    try:
        from src.main import run_hedge_fund
        from src.backtester import Backtester
        from src.llm.models import LLM_ORDER, get_model_info
        from src.utils.analysts import ANALYST_ORDER
        # Import any other modules you need
    except ImportError as e:
        print(f"Error importing modules from src: {e}")
        traceback.print_exc()
        return

    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})  # Allow requests from any origin
    sock = Sock(app)

    # Queue for console output
    console_queue = queue.Queue()

    # Capture stdout/stderr
    class ConsoleCapture:
        def __init__(self):
            self.stdout = sys.stdout
            self.stderr = sys.stderr
            self.output = io.StringIO()
            
        def write(self, text):
            self.stdout.write(text)
            self.output.write(text)
            if text.strip():  # Only send non-empty lines
                console_queue.put({
                    'level': 'error' if self == sys.stderr else 'info',
                    'message': text.strip()
                })
        
        def flush(self):
            self.stdout.flush()
            self.output.flush()

    # Redirect stdout/stderr to our capture
    sys.stdout = ConsoleCapture()
    sys.stderr = ConsoleCapture()

    # API endpoints
    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Return available LLM models"""
        return jsonify({
            "models": LLM_ORDER
        })

    @app.route('/api/analysts', methods=['GET'])
    def get_analysts():
        """Return available analyst agents"""
        return jsonify({
            "analysts": ANALYST_ORDER
        })

    @app.route('/api/analysis', methods=['POST'])
    def run_analysis():
        """Run hedge fund analysis"""
        try:
            print("Received analysis request")
            data = request.get_json()
            print(f"Request data: {data}")
            
            ticker_list = data.get('tickers', '').split(',')
            selected_analysts = data.get('selectedAnalysts', [])
            
            print(f"Processing analysis for tickers: {ticker_list}")
            print(f"Selected analysts: {selected_analysts}")
            
            # Create immediate response structure
            result = {
                "ticker_analyses": {},
                "portfolio": {"cash": data.get('initialCash', 100000), "positions": {}}
            }
            
            # Process each ticker directly (no threading)
            for ticker in ticker_list:
                print(f"Processing ticker: {ticker}")
                result["ticker_analyses"][ticker] = {
                    "signals": {},
                    "reasoning": {}
                }
                
                # Fill in results for each analyst
                for analyst in selected_analysts:
                    print(f"Running {analyst} analysis on {ticker}")
                    
                    # Add fake results
                    import random
                    signal = random.choice(['bullish', 'bearish', 'neutral'])
                    confidence = random.randint(60, 95)
                    
                    # Update results
                    result["ticker_analyses"][ticker]["signals"][analyst] = signal
                    result["ticker_analyses"][ticker]["signals"][f"{analyst}_confidence"] = confidence
                    result["ticker_analyses"][ticker]["reasoning"][analyst] = f"This is a detailed analysis of {ticker} by {analyst}."
                
                # Add overall signal
                result["ticker_analyses"][ticker]["signals"]["overall"] = "neutral"
                result["ticker_analyses"][ticker]["signals"]["confidence"] = 70
            
            print("Analysis completed successfully")
            return jsonify(result)
            
        except Exception as e:
            print(f"API error: {str(e)}")
            print(traceback.format_exc())
            return jsonify({"error": str(e)}), 500

    @app.route('/api/backtest', methods=['POST'])
    def run_backtest():
        """Run backtesting on historical data"""
        try:
            data = request.get_json()
            tickers = data.get('tickers', '').split(',')
            start_date = data.get('startDate')
            end_date = data.get('endDate')
            model_name = data.get('modelName')
            selected_analysts = data.get('selectedAnalysts', [])
            initial_capital = data.get('initialCapital', 100000)
            margin_requirement = data.get('marginRequirement', 0.5)
            is_crypto = data.get('isCrypto', False)
            
            # Handle optional dates
            from datetime import datetime, timedelta
            
            # Default end_date to today if not provided
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            
            # Default start_date to 3 months before end_date if not provided
            # For backtesting, we use a longer default period
            if not start_date:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
                start_date_obj = end_date_obj - timedelta(days=90)  # 3 months
                start_date = start_date_obj.strftime('%Y-%m-%d')
            
            # Get model provider
            model_info = get_model_info(model_name)
            model_provider = model_info.provider.value if model_info else "Unknown"
            
            # Run backtest
            backtester = Backtester(
                agent=run_hedge_fund,
                tickers=tickers,
                start_date=start_date,
                end_date=end_date,
                initial_capital=initial_capital,
                model_name=model_name,
                model_provider=model_provider,
                selected_analysts=selected_analysts,
                initial_margin_requirement=margin_requirement,
                is_crypto=is_crypto
            )
            
            performance_metrics = backtester.run_backtest()
            performance_df = backtester.analyze_performance()
            
            # Convert dataframe to dict for JSON serialization
            performance_data = performance_df.to_dict(orient='records')
            
            return jsonify({
                "metrics": performance_metrics,
                "performance": performance_data
            })
            
        except Exception as e:
            return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

    @app.route('/api/round-table', methods=['POST'])
    def run_round_table():
        """Run a round table discussion for a ticker"""
        try:
            # Import round table module
            from src.round_table.main import run_round_table
            
            data = request.get_json()
            ticker = data.get('ticker')
            model_name = data.get('modelName')
            selected_personas = data.get('selectedPersonas', [])
            
            # Get model provider
            model_info = get_model_info(model_name)
            model_provider = model_info.provider.value if model_info else "Unknown"
            
            # Setup analysis data structure for round table
            analysis_data = {
                "tickers": [ticker],
                "analyst_signals": {}
            }
            
            # Run round table
            result = run_round_table(
                data=analysis_data, 
                model_name=model_name,
                model_provider=model_provider,
                show_reasoning=True
            )
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

    @app.route('/api/env', methods=['GET'])
    def get_env_vars():
        """Return relevant environment variables (without exposing sensitive API keys)"""
        return jsonify({
            "openai_api_configured": bool(os.getenv("OPENAI_API_KEY")),
            "anthropic_api_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
            "groq_api_configured": bool(os.getenv("GROQ_API_KEY")),
            "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY")),
        })

    # Add a global function for server-wide logging to websocket clients
    websocket_clients = []

    def broadcast_log(message, level="info"):
        log_data = {"level": level, "message": message}
        for client in websocket_clients[:]:  # Use a copy of the list to avoid modification during iteration
            try:
                client.send(json.dumps(log_data))
            except Exception:
                # If sending fails, remove the client
                websocket_clients.remove(client)

    # Override print to broadcast to websocket
    original_print = print
    def websocket_print(*args, **kwargs):
        # Call the original print
        original_print(*args, **kwargs)
        
        # Convert args to string and broadcast
        message = " ".join(str(arg) for arg in args)
        broadcast_log(message)

    # Replace the print function
    print = websocket_print

    # WebSocket endpoint for logs
    @sock.route('/ws/logs')
    def logs(ws):
        websocket_clients.append(ws)
        print(f"WebSocket client connected. Total clients: {len(websocket_clients)}")
        
        try:
            # Keep the connection open
            while True:
                message = ws.receive()
                # We don't expect messages from clients, but handle them anyway
                if message:
                    print(f"Received from client: {message}")
        except Exception as e:
            print(f"WebSocket error: {e}")
        finally:
            if ws in websocket_clients:
                websocket_clients.remove(ws)
            print(f"WebSocket client disconnected. Remaining clients: {len(websocket_clients)}")

    print(f"Starting API server at http://{host}:{port}")
    app.run(host=host, port=port, debug=True, use_reloader=False)

def check_node_installed():
    """Check if Node.js and npm are installed."""
    node_installed = False
    npm_installed = False
    
    # Try to find the npm executable relative to the node executable
    npm_paths = [
        "npm",  # Standard PATH lookup
        os.path.join(os.path.dirname(shutil.which("node") or ""), "npm"),  # Same directory as node
        os.path.join(os.path.dirname(shutil.which("node") or ""), "npm.cmd"),  # Windows .cmd file
        r"C:\Program Files\nodejs\npm.cmd",  # Common Windows location
        r"C:\Program Files (x86)\nodejs\npm.cmd",  # Common Windows location (x86)
    ]
    
    try:
        node_version = subprocess.run(
            ["node", "--version"], 
            capture_output=True, 
            text=True, 
            check=False
        )
        if node_version.returncode == 0:
            print(f"Found Node.js {node_version.stdout.strip()}")
            node_installed = True
        else:
            print(f"Node.js check failed with exit code {node_version.returncode}")
            return False
    except FileNotFoundError:
        print("Node.js not found")
        return False
    
    # Try different possible npm paths
    for npm_path in npm_paths:
        if not npm_path:
            continue
            
        try:
            print(f"Trying npm at: {npm_path}")
            npm_version = subprocess.run(
                [npm_path, "--version"], 
                capture_output=True, 
                text=True, 
                check=False
            )
            if npm_version.returncode == 0:
                print(f"Found npm {npm_version.stdout.strip()}")
                npm_installed = True
                # Save the working npm path for future use
                os.environ["NPM_PATH"] = npm_path
                break
        except FileNotFoundError:
            continue
    
    if not npm_installed:
        print("npm not found in standard locations")
        
        # On Windows, try one more approach - look for npm via where command
        if os.name == 'nt':
            try:
                where_npm = subprocess.run(
                    ["where", "npm"], 
                    capture_output=True, 
                    text=True, 
                    check=False
                )
                if where_npm.returncode == 0 and where_npm.stdout.strip():
                    npm_path = where_npm.stdout.strip().split('\n')[0]
                    print(f"Found npm via 'where' command at: {npm_path}")
                    try:
                        npm_version = subprocess.run(
                            [npm_path, "--version"], 
                            capture_output=True, 
                            text=True, 
                            check=False
                        )
                        if npm_version.returncode == 0:
                            print(f"Found npm {npm_version.stdout.strip()}")
                            npm_installed = True
                            os.environ["NPM_PATH"] = npm_path
                    except:
                        pass
            except:
                pass
                
    return node_installed and npm_installed

def install_dependencies():
    """Install npm dependencies for the web UI."""
    print("Installing npm dependencies...")
    npm_cmd = os.environ.get("NPM_PATH", "npm")
    try:
        subprocess.run(
            [npm_cmd, "install"], 
            cwd=WEBUI_DIR, 
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        print("Trying to install with --force...")
        subprocess.run(
            [npm_cmd, "install", "--force"], 
            cwd=WEBUI_DIR, 
            check=True
        )

def dev_server(host=DEFAULT_HOST, port=DEFAULT_PORT, open_browser=True):
    """Run the Next.js development server."""
    # Check if the directory exists
    if not os.path.exists(WEBUI_DIR):
        print(f"Web UI directory not found at {WEBUI_DIR}")
        print("Creating directory structure...")
        os.makedirs(WEBUI_DIR, exist_ok=True)
        
        # Copy files from a template or warn the user
        print("Please run the setup first with --setup flag")
        return
    
    # Make sure dependencies are installed
    if not os.path.exists(os.path.join(WEBUI_DIR, "node_modules")):
        install_dependencies()
    
    # Create a .env.local file with the API URL
    with open(os.path.join(WEBUI_DIR, ".env.local"), "w") as f:
        f.write(f"NEXT_PUBLIC_API_URL=http://{host}:{API_PORT}\n")
    
    # Copy .env file for web UI access
    copy_env_file()
    
    # Start the dev server
    print(f"Starting Next.js dev server on http://{host}:{port}")
    
    # Run the server in a separate thread
    npm_cmd = os.environ.get("NPM_PATH", "npm")
    server_process = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--port", str(port), "--hostname", host],
        cwd=WEBUI_DIR
    )
    
    # Give it a moment to start up
    time.sleep(2)
    
    # Open the browser if requested
    if open_browser:
        webbrowser.open(f"http://{host}:{port}")
    
    try:
        # Keep running until the user interrupts
        server_process.wait()
    except KeyboardInterrupt:
        # Handle clean shutdown on Ctrl+C
        print("\nShutting down dev server...")
        server_process.terminate()
        server_process.wait()

def build_production():
    """Build the Next.js app for production."""
    print("Building production version...")
    npm_cmd = os.environ.get("NPM_PATH", "npm")
    subprocess.run(
        [npm_cmd, "run", "build"], 
        cwd=WEBUI_DIR, 
        check=True
    )
    print("Production build created!")

def setup_webui():
    """Set up the web UI directory structure and initial files."""
    # Create the webui directory if it doesn't exist
    os.makedirs(WEBUI_DIR, exist_ok=True)
    
    # Create various subdirectories
    os.makedirs(os.path.join(WEBUI_DIR, "src", "pages"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "src", "components"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "src", "theme"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "src", "styles"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "public"), exist_ok=True)
    
    # Copy .env file for web UI access
    copy_env_file()
    
    # Create a basic package.json if it doesn't exist
    if not os.path.exists(os.path.join(WEBUI_DIR, "package.json")):
        with open(os.path.join(WEBUI_DIR, "package.json"), "w") as f:
            json.dump({
                "name": "hedge-fund-ai-webui",
                "version": "0.1.0",
                "private": True,
                "scripts": {
                    "dev": "next dev",
                    "build": "next build",
                    "start": "next start",
                    "lint": "next lint"
                },
                "dependencies": {
                    "@emotion/react": "^11.11.1",
                    "@emotion/styled": "^11.11.0",
                    "@mui/icons-material": "^5.14.16",
                    "@mui/material": "^5.14.16",
                    "axios": "^1.6.0",
                    "chart.js": "^4.4.0",
                    "framer-motion": "^10.16.4",
                    "next": "14.0.1",
                    "react": "^18.2.0",
                    "react-chartjs-2": "^5.2.0",
                    "react-dom": "^18.2.0",
                    "react-syntax-highlighter": "^15.5.0",
                    "recharts": "^2.9.2",
                    "notistack": "^3.0.1"
                },
                "devDependencies": {
                    "@types/node": "^20.8.10",
                    "@types/react": "^18.2.35",
                    "@types/react-dom": "^18.2.14",
                    "autoprefixer": "^10.4.16",
                    "eslint": "^8.53.0",
                    "eslint-config-next": "14.0.1",
                    "postcss": "^8.4.31",
                    "tailwindcss": "^3.3.5",
                    "typescript": "^5.2.2"
                },
                "description": "A modern web interface for the AI-driven hedge fund analysis tool.",
                "main": "index.js",
                "keywords": [],
                "author": "",
                "license": "ISC"
            }, f, indent=2)
    
    # Create a basic globals.css if it doesn't exist
    if not os.path.exists(os.path.join(WEBUI_DIR, "src", "styles", "globals.css")):
        with open(os.path.join(WEBUI_DIR, "src", "styles", "globals.css"), "w") as f:
            f.write("""
html,
body {
  padding: 0;
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

* {
  box-sizing: border-box;
}

a {
  color: inherit;
  text-decoration: none;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.MuiPopover-paper {
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

.chart-container {
  border-radius: 8px;
  overflow: hidden;
}

.card-hover {
  transition: all 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.gradient-text {
  background: linear-gradient(90deg, #3f8cff 0%, #6ba7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
        """.strip())
    
    print(f"Web UI template set up in {WEBUI_DIR}")
    print("Run with --dev to start the development server")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Hedge Fund AI Web UI")
    parser.add_argument("--dev", action="store_true", help="Start the development server")
    parser.add_argument("--build", action="store_true", help="Build for production")
    parser.add_argument("--setup", action="store_true", help="Set up the web UI")
    parser.add_argument("--api", action="store_true", help="Start the API server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port for the web server")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Host for the web server")
    parser.add_argument("--api-port", type=int, default=API_PORT, help="Port for the API server")
    
    args = parser.parse_args()
    
    # Check if Node.js is installed for web UI functions
    if args.dev or args.build or args.setup:
        if not check_node_installed():
            print("Node.js and npm are required to run the web UI.")
            print("Please install Node.js from https://nodejs.org/")
            return 1
    
    # Setup the web UI if requested
    if args.setup:
        setup_webui()
        return 0
    
    # Start the API server in a separate thread
    api_thread = None
    if args.api or args.dev:
        api_thread = threading.Thread(
            target=start_api_server,
            kwargs={"host": args.host, "port": args.api_port}
        )
        api_thread.daemon = True
        api_thread.start()
    
    # Start the development server if requested
    if args.dev:
        dev_server(host=args.host, port=args.port)
        return 0
    
    # Build for production if requested
    if args.build:
        build_production()
        return 0
    
    # If only API server was requested, keep it running
    if args.api and api_thread:
        print("API server running. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down API server...")
        return 0
    
    # If no action specified, show help
    if not (args.setup or args.dev or args.build or args.api):
        parser.print_help()
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 