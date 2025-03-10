# ritadel - Under development

<img align="right" width="400" src="https://github.com/user-attachments/assets/4eab549a-76ce-4e88-aac7-1f74a19b6e6d" alt="pepe"/>

Leverage the latest AI, Realtime Financial stats, news, algorithms, reddit posts... to make trading decisions for you. 

Powered by:
- Nancy Pelosi's highly intelligent plays
- avg WSB regard and his posts on the reddit
- boomer buffett's boomer logic
- And more! 
- Jim cramar to be added...

Basically created an AI chatroom where boomer buffet and wsb regard work together as a hedge fund.

This is a fork of [ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) By [viratt](https://github.com/virattt) 

## Key Features

### Multi-Agent System
- **Value Investing Team**: Warren Buffett, Charlie Munger, Ben Graham
- **Growth & Innovation**: Cathie Wood, Bill Ackman
- **Alternative Strategies**: Nancy Pelosi (policy edge), WSB (momentum/memes)
- **Technical Specialists**: Price action, fundamentals, sentiment analysis
- **Risk Management**: Position sizing, portfolio optimization

### Round Table Discussions
- Real-time AI conversations between agents
- Debate investment theses and challenge assumptions
- Reach consensus through structured dialogue
- Natural language interactions with personality

### Analysis Capabilities
- Multi-source financial data integration
- Technical and fundamental analysis
- Sentiment analysis from news and social media
- Cryptocurrency market analysis
- Portfolio management and risk assessment

### Modern Web Interface
- Real-time analysis updates
- Interactive charts and visualizations
- Backtesting capabilities
- Trade history and performance tracking

## Installation

### Prerequisites
- Python 3.9+
- Poetry (Python package manager)
- Node.js 16+ (for web UI)
- At least one LLM API key (OpenAI, Anthropic, Groq, or Gemini)

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/KRSHH/ritadel.git
cd ritadel
```

2. Install Poetry if needed:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

3. Install dependencies:
```bash
poetry install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. Start the web interface:
```bash
# Terminal 1: Start API server
poetry run python webui.py --api

# Terminal 2: Start web UI
cd webui
npm install
npm run dev
```

Visit http://localhost:3000 to access the web interface.

### Round Table conference output example (CLI) -
![image](https://github.com/user-attachments/assets/1fa62f93-62b1-4af8-b2f6-9469eea17fa8)

## Usage

### Command Line Interface
```bash
# Basic analysis
poetry run python src/main.py --ticker AAPL,MSFT,NVDA

# Round table discussion
poetry run python src/main.py --ticker TSLA --round-table

# Backtest with custom parameters
poetry run python src/backtester.py --ticker BTC-USD,ETH-USD --crypto --initial-cash 100000
```
### Web Interface
1. Navigate to http://localhost:3000
2. Select analysis type (single analysis, backtest, or round table)
3. Enter ticker symbols
4. Choose AI analysts to include
5. View real-time analysis and discussions

## Configuration

### Required API Keys
- At least one LLM provider (OpenAI/Anthropic/Groq/Gemini)
- Alpha Vantage (free tier available)
- Reddit API (for WSB agent)

### Optional API Keys
- StockData.org (100 free requests/day)
- Finnhub
- EOD Historical Data
- CoinGecko (for crypto)
- CryptoCompare (for crypto)

See `.env.example` for all configuration options.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

This is a fork of [ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) By [viratt](https://github.com/virattt) 

yfinance used for financial data
