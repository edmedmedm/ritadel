# ritadel

<img align="right" width="400" src="https://github.com/user-attachments/assets/1df4003a-7b17-497a-beed-e3e35409a5b8" alt="pepe"/>

tl;dr: Made some AI characters fight in a chatroom with all info. ramped up all the way to match an avg wsb regard

Powered by:
- Nancy Pelosi's highly intelligent plays
- Cathie Wood to drain your portfolio
- avg WSB regard and his posts on the reddit
- boomer buffett's 
- And more! 
- Jim cramar to be added...

Basically created an AI chatroom where boomer buffet and wsb regard work together as a hedge fund.



*Disclaimer: This is what peak degeneracy looks like. If you're actually taking financial advice from this, you belong here.*

## 🌟 Features

### 🎭 Multi-Agent Architecture

The system employs specialized agents with unique investment perspectives:

| Agent | Investment Style | Focus Areas |
|-------|-----------------|-------------|
| Warren Buffett | Value investing | Quality businesses at fair prices, economic moats, long-term outlook |
| Charlie Munger | Value investing | Business quality, mental models, competitive advantages |
| Ben Graham | Deep value | Margin of safety, undervalued assets, conservative metrics |
| Bill Ackman | Activist investing | High-quality businesses, concentrated positions, catalysts for change |
| Cathie Wood | Disruptive innovation | Exponential growth, technological breakthroughs, future trends |
| Nancy Pelosi | Policy-driven | Legislative impacts, regulatory changes, government contracts |
| WSB | Momentum/contrarian | Meme potential, short squeezes, options plays, social sentiment |

#### Analysis Specialists

| Specialist | Focus | Methodology |
|------------|-------|-------------|
| Technical Analyst | Price patterns | Trend following, mean reversion, momentum, volatility |
| Fundamental Analyst | Financial statements | Profitability, growth, financial health, valuation ratios |
| Valuation Analyst | Intrinsic value | DCF, owner earnings, margin of safety calculations |
| Sentiment Analyst | Market psychology | Insider trading patterns, news sentiment, social media |
| Risk Manager | Position sizing | Portfolio exposure, volatility management, cash allocation |
| Portfolio Manager | Final decisions | Signal aggregation, position sizing, execution strategy |

### 🔄 Round Table Discussion

The agents participate in a simulated round table discussion where they:
1. Present initial positions
2. Challenge each other's assumptions
3. Debate key points
4. Refine their views
5. Reach a consensus decision

### 📊 Analysis Features

- Real-time financial data analysis
- Multi-factor decision making
- Sentiment analysis
- Technical indicator calculations
- Risk assessment
- Position sizing recommendations

## 🛠️ Setup

### Prerequisites

- Python 3.8+
- Poetry package manager
- At least one LLM API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KRSHH/Ritadel.git
cd Ritadel
```

2. Install Poetry (if not already installed):
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
```

### 🔑 API Keys Configuration

Configure your API keys in `.env`:

#### Required APIs:

```bash
# At least ONE of these LLM providers is required:

# OpenAI API Key (for GPT-4, GPT-3.5)
OPENAI_API_KEY=your-openai-api-key

# Groq API Key (for Mixtral, Llama)
GROQ_API_KEY=your-groq-api-key

# Anthropic API Key (for Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Gemini API Key (for Google's Gemini models)
GEMINI_API_KEY=your-gemini-api-key

# REQUIRED: Alpha Vantage API Key (free tier) for financial data
# Get your free API key at https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# For WSB agent (required only if using the WSB agent) and round-table discussions
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=Ritadel:v1.0 (by KRSHH)
```

#### Optional APIs for Enhanced Features:

```bash
# Additional free financial data sources (all optional but recommended)
STOCKDATA_API_KEY=your-stockdata-api-key  # Free tier available at stockdata.org
FINNHUB_API_KEY=your-finnhub-api-key      # Free tier available at finnhub.io
EODHD_API_KEY=your-eodhd-api-key          # Free tier available at eodhistoricaldata.com
```

**API Key Priority System:**
1. At least one LLM provider API key is required (OpenAI, Groq, Anthropic, or Gemini)
2. Alpha Vantage is the primary financial data source (free tier is sufficient)
3. Additional financial APIs provide redundancy in this priority order:
   a. StockData.org
   b. EODHD
   c. Finnhub

**Note**: 
- The system uses multiple free financial data sources with automatic fallbacks if one fails
- Reddit API keys are only required if you want to use the WSB Agent's real-time sentiment analysis
- To get Reddit API keys:
  1. Visit https://www.reddit.com/prefs/apps
  2. Click "Create App" or "Create Another App"
  3. Select "script" as the application type
  4. Fill in the required information
  5. Use the generated client ID and secret in your .env file

## 🚀 Usage

### Running the Hedge Fund

Basic usage:
```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA
```

With detailed reasoning:
```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA --show-reasoning
```

With date range:
```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA --start-date 2024-01-01 --end-date 2024-03-01
```

### Running the Backtester

Basic backtest:
```bash
poetry run python src/backtester.py --ticker AAPL,MSFT,NVDA
```

With date range:
```bash
poetry run python src/backtester.py --ticker AAPL,MSFT,NVDA --start-date 2024-01-01 --end-date 2024-03-01
```

## 📁 Project Structure

```
ai-hedge-fund/
├── src/
│   ├── agents/                  # Agent implementations
│   │   ├── warren_buffett.py    # Value investing legend
│   │   ├── cathie_wood.py      # Growth/innovation focus
│   │   ├── technical.py        # Technical analysis
│   │   ├── fundamentals.py     # Fundamental analysis
│   │   └── ...                 # Other agents
│   ├── round_table/            # Round table discussion
│   │   ├── engine.py          # Discussion logic
│   │   ├── display.py         # Output formatting
│   │   └── main.py           # Entry point
│   ├── tools/                 # Utility tools
│   ├── data/                  # Data handling
│   ├── llm/                   # LLM integration
│   ├── main.py               # Main entry point
│   └── backtester.py         # Backtesting system
├── tests/                    # Test suite
├── poetry.toml              # Poetry configuration
└── README.md               # This file
```

## 🐛 Bug Reports & Feature Requests

- For bugs, open an issue with the `bug` label
- For feature requests, open an issue with the `enhancement` label

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
