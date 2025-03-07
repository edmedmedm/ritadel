# LLM-Bets

<div style="display: flex; align-items: start;">
<div style="flex: 1;">

Ever wanted to lose money faster using cutting-edge AI? Look no further! LLM-Bets combines the power of Large Language Models with the chaos of the stock market to help you achieve unprecedented levels of "investment creativity." 

We've assembled a dream team of AI agents impersonating famous investors - from Warren Buffett's patient value investing to WSB's YOLO strategies. Watch them argue in a virtual round table while your portfolio does gymnastics! 🤸‍♂️

Features:
- 🤖 Multiple AI personalities with conflicting advice
- 📈 Real-time financial data (that you'll probably ignore)
- 🎭 Simulated drama between AI investors
- 🎲 Advanced loss generation techniques
- 🚀 Rocket emojis (because that's important)

Remember: This is what happens when you let AI manage your Wendy's paycheck. Use at your own risk! 

*Not financial advice. Unless you're inverse trading, then maybe?*

</div>
<div style="flex: 0 0 400px; margin-left: 20px;">
<img src="https://github.com/user-attachments/assets/1df4003a-7b17-497a-beed-e3e35409a5b8" alt="Price-to-Entertainment Ratio" width="400"/>
</div>
</div>

## 🌟 Features

### 🎭 Multi-Agent Architecture

The system employs several specialized agents, each with unique perspectives and strategies:

#### Value Investors
- **Warren Buffett Agent** - Seeks wonderful companies at fair prices
- **Charlie Munger Agent** - Focuses on high-quality businesses with strong moats
- **Ben Graham Agent** - Hunts for undervalued stocks with margin of safety
- **Bill Ackman Agent** - Takes activist positions with catalysts for change

#### Growth & Innovation
- **Cathie Wood Agent** - Specializes in disruptive innovation and growth
- **WSB Agent** - Focuses on momentum and high-conviction plays

#### Technical & Fundamental
- **Technical Analyst** - Analyzes price patterns and technical indicators
- **Fundamental Analyst** - Deep dives into financial statements
- **Valuation Analyst** - Focuses on intrinsic value calculations
- **Sentiment Analyst** - Tracks market psychology and social sentiment

#### Policy & Risk
- **Nancy Pelosi Agent** - Analyzes policy impacts and regulatory changes
- **Risk Manager** - Monitors risk metrics and position limits

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
- API keys for LLM providers and financial data

### Installation

1. Clone the repository:
```bash
git clone https://github.com/virattt/ai-hedge-fund.git
cd ai-hedge-fund
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

```bash
# OpenAI API Key (for GPT-4, GPT-3.5)
OPENAI_API_KEY=your-openai-api-key

# Groq API Key (for Mixtral, Llama)
GROQ_API_KEY=your-groq-api-key

# Anthropic API Key (for Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Gemini API Key (for Google's Gemini models)
GEMINI_API_KEY=your-gemini-api-key

# Financial Data API Key
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# Reddit API Configuration (for WSB sentiment analysis)
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=your-app-name:v1.0 (by /u/your-username)
```

**Note**: 
- You need at least one LLM provider API key (OpenAI, Groq, Anthropic, or Gemini)
- Free financial data is available for AAPL, GOOGL, MSFT, NVDA, and TSLA
- Reddit API keys are required for the WSB Agent's sentiment analysis
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

Please keep pull requests focused and include tests for new functionality.

## 🐛 Bug Reports & Feature Requests

- For bugs, open an issue with the `bug` label
- For feature requests, open an issue with the `enhancement` label

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
