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

# Configuration
WEBUI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "webui")
DEFAULT_PORT = 3000
DEFAULT_HOST = "localhost"

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
        f.write(f"NEXT_PUBLIC_API_URL=http://{host}:5000\n")
    
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

def start_api_server(host="localhost", port=5000):
    """Start the API server that the web UI will communicate with."""
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    
    # Import your hedge fund functions
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from main import run_hedge_fund
    
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/api/run-analysis', methods=['POST'])
    def api_run_analysis():
        data = request.json
        tickers = data.get('tickers', [])
        start_date = data.get('startDate', '')
        end_date = data.get('endDate', '')
        selected_analysts = data.get('selectedAnalysts', [])
        model_name = data.get('modelName', 'gpt-4o')
        model_provider = data.get('modelProvider', 'OpenAI')
        
        # Create portfolio structure
        portfolio = {
            "cash": data.get('initialCash', 100000),
            "margin_requirement": data.get('marginRequirement', 0),
            "positions": {ticker: {"long": 0, "short": 0, "long_cost_basis": 0.0, "short_cost_basis": 0.0} for ticker in tickers},
            "realized_gains": {ticker: {"long": 0.0, "short": 0.0} for ticker in tickers}
        }
        
        # Run the analysis
        result = run_hedge_fund(
            tickers=tickers,
            start_date=start_date,
            end_date=end_date,
            portfolio=portfolio,
            show_reasoning=data.get('showReasoning', True),
            selected_analysts=selected_analysts,
            model_name=model_name,
            model_provider=model_provider,
            is_crypto=data.get('isCrypto', False)
        )
        
        return jsonify(result)
    
    # Add endpoints for backtest, round-table, etc.
    
    print(f"Starting API server on http://{host}:{port}")
    app.run(host=host, port=port, debug=True)

def setup_webui():
    """Set up the web UI by copying template files."""
    if not os.path.exists(WEBUI_DIR):
        os.makedirs(WEBUI_DIR, exist_ok=True)
    
    # Create package.json if it doesn't exist
    package_json_path = os.path.join(WEBUI_DIR, "package.json")
    if not os.path.exists(package_json_path):
        # Define Next.js starter package.json
        package_json = {
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
                "recharts": "^2.9.2"
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
            }
        }
        
        with open(package_json_path, "w") as f:
            json.dump(package_json, f, indent=2)
    
    # Create directory structure
    os.makedirs(os.path.join(WEBUI_DIR, "src", "pages"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "src", "components"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "src", "theme"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "src", "styles"), exist_ok=True)
    os.makedirs(os.path.join(WEBUI_DIR, "public"), exist_ok=True)
    
    # Create a global CSS file
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
    
    args = parser.parse_args()
    
    # Check if Node.js is installed
    if not check_node_installed():
        print("Node.js and npm are required to run the web UI.")
        print("Please install Node.js from https://nodejs.org/")
        return 1
    
    # Setup the web UI if requested
    if args.setup:
        setup_webui()
        return 0
    
    # Start the API server in a separate thread if requested
    if args.api:
        api_thread = threading.Thread(
            target=start_api_server,
            kwargs={"host": args.host, "port": 5000}
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
    
    # If no action specified, show help
    if not (args.setup or args.dev or args.build or args.api):
        parser.print_help()
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 