import { useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, TextField, Button, Autocomplete, Checkbox, Chip, FormControlLabel, FormGroup, Divider, Stepper, Step, StepLabel, StepContent, Paper, LinearProgress, Alert } from '@mui/material';
import { Search as SearchIcon, Send as SendIcon, Check as CheckIcon } from '@mui/icons-material';

// Sample data
const modelOptions = [
  { label: '[anthropic] claude-3.5-sonnet', value: 'claude-3-5-sonnet-latest' },
  { label: '[anthropic] claude-3.7-sonnet', value: 'claude-3-7-sonnet-latest' },
  { label: '[groq] deepseek-r1 70b', value: 'deepseek-r1-distill-llama-70b' },
  { label: '[groq] llama-3.3 70b', value: 'llama-3.3-70b-versatile' },
  { label: '[openai] gpt-4o', value: 'gpt-4o' },
  { label: '[openai] gpt-4o-mini', value: 'gpt-4o-mini' },
  { label: '[openai] o1', value: 'o1' },
  { label: '[openai] o3-mini', value: 'o3-mini' },
  { label: '[gemini] gemini-2.0-flash', value: 'gemini-2.0-flash' },
];

const analystOptions = [
  { label: 'Warren Buffett', value: 'warren_buffett_agent', description: 'Analyzes quality businesses with strong fundamentals and reasonable prices' },
  { label: 'Charlie Munger', value: 'charlie_munger_agent', description: 'Evaluates companies using mental models and considers moats and management quality' },
  { label: 'Ben Graham', value: 'ben_graham_agent', description: 'Focuses on deep value stocks trading below intrinsic value with margin of safety' },
  { label: 'Bill Ackman', value: 'bill_ackman_agent', description: 'Identifies high-quality businesses with long-term growth and activist potential' },
  { label: 'Cathie Wood', value: 'cathie_wood_agent', description: 'Specializes in disruptive innovation and high-growth technology companies' },
  { label: 'Nancy Pelosi', value: 'nancy_pelosi_agent', description: 'Analyzes stocks with policy/regulatory advantages and asymmetric information opportunities' },
  { label: 'WSB', value: 'wsb_agent', description: 'Identifies meme stocks, short squeeze candidates, and momentum plays' },
  { label: 'Technical Analysis', value: 'technical_analyst_agent', description: 'Uses price patterns, trends, and indicators to generate trading signals' },
  { label: 'Fundamental Analysis', value: 'fundamentals_agent', description: 'Examines company fundamentals like profitability, growth, and financial health' },
  { label: 'Sentiment Analysis', value: 'sentiment_agent', description: 'Analyzes market sentiment from news and insider trading' },
  { label: 'Valuation Analysis', value: 'valuation_agent', description: 'Calculates intrinsic value using multiple valuation methodologies' },
  { label: 'Risk Management', value: 'risk_management_agent', description: 'Controls position sizing based on portfolio risk factors' },
];

export default function Analysis() {
  const [activeStep, setActiveStep] = useState(0);
  const [tickers, setTickers] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedAnalysts, setSelectedAnalysts] = useState([]);
  const [initialCash, setInitialCash] = useState(100000);
  const [showReasoning, setShowReasoning] = useState(true);
  const [runRoundTable, setRunRoundTable] = useState(false);
  const [isCrypto, setIsCrypto] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [progress, setProgress] = useState({});
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    // Simulated progress updates - in a real app, this would come from an API
    const ticker_list = tickers.split(',').map(t => t.trim());
    const timer = setInterval(() => {
      setProgress((prev) => {
        const agentKeys = selectedAnalysts.map(a => a.value);
        const newProgress = { ...prev };
        
        // Randomly update progress for a random ticker and agent
        const randomTicker = ticker_list[Math.floor(Math.random() * ticker_list.length)];
        const randomAgent = agentKeys[Math.floor(Math.random() * agentKeys.length)];
        
        if (!newProgress[randomAgent]) {
          newProgress[randomAgent] = {};
        }
        
        if (!newProgress[randomAgent][randomTicker]) {
          newProgress[randomAgent][randomTicker] = {
            status: 'Initializing...',
            percent: 0
          };
        }
        
        const currentStatus = newProgress[randomAgent][randomTicker];
        
        // Progress logic
        if (currentStatus.percent < 100) {
          const increment = Math.floor(Math.random() * 10) + 5;
          const newPercent = Math.min(currentStatus.percent + increment, 100);
          
          let status = currentStatus.status;
          if (newPercent < 30) status = 'Fetching data...';
          else if (newPercent < 60) status = 'Analyzing...';
          else if (newPercent < 90) status = 'Generating report...';
          else status = 'Finalizing...';
          
          newProgress[randomAgent][randomTicker] = {
            status,
            percent: newPercent
          };
        }
        
        // Check if all are complete
        let allComplete = true;
        for (const agent of agentKeys) {
          if (!newProgress[agent]) {
            allComplete = false;
            break;
          }
          
          for (const ticker of ticker_list) {
            if (!newProgress[agent][ticker] || newProgress[agent][ticker].percent < 100) {
              allComplete = false;
              break;
            }
          }
        }
        
        if (allComplete) {
          clearInterval(timer);
          setTimeout(() => {
            setIsAnalyzing(false);
            setActiveStep(3); // Move to results step
            
            // Generate simulated results for demo purpose
            const mockResults = {
              tickers: ticker_list,
              date: new Date().toISOString().split('T')[0],
              signals: ticker_list.reduce((acc, ticker) => {
                acc[ticker] = {
                  overallSignal: Math.random() > 0.5 ? 'bullish' : (Math.random() > 0.5 ? 'bearish' : 'neutral'),
                  confidence: Math.floor(Math.random() * 40) + 60,
                  analysts: selectedAnalysts.map(analyst => ({
                    name: analyst.label,
                    signal: Math.random() > 0.6 ? 'bullish' : (Math.random() > 0.5 ? 'bearish' : 'neutral'),
                    confidence: Math.floor(Math.random() * 40) + 60,
                    reasoning: `Analysis based on ${selectedModel?.label || 'AI model'} evaluation.`
                  }))
                };
                return acc;
              }, {})
            };
            
            setAnalysisResults(mockResults);
          }, 1000);
        }
        
        return newProgress;
      });
    }, 300);
    
    // Cleanup
    return () => clearInterval(timer);
  };
  
  const handleSelectAllAnalysts = () => {
    if (selectedAnalysts.length === analystOptions.length) {
      setSelectedAnalysts([]);
    } else {
      setSelectedAnalysts([...analystOptions]);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return tickers.trim() !== '' && startDate && endDate;
      case 1:
        return selectedModel !== null;
      case 2:
        return selectedAnalysts.length > 0;
      default:
        return true;
    }
  };

  const steps = [
    {
      label: 'Select Stocks',
      description: 'Enter ticker symbols and date range',
      content: (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Ticker Symbols"
            fullWidth
            margin="normal"
            placeholder="AAPL, MSFT, GOOGL"
            value={tickers}
            onChange={(e) => setTickers(e.target.value)}
            helperText="Enter comma-separated ticker symbols"
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isCrypto}
                  onChange={(e) => setIsCrypto(e.target.checked)}
                />
              }
              label="Analyze cryptocurrency instead of stocks"
            />
          </FormGroup>
        </Box>
      ),
    },
    {
      label: 'Select LLM Model',
      description: 'Choose an AI model for analysis',
      content: (
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            options={modelOptions}
            value={selectedModel}
            onChange={(event, newValue) => {
              setSelectedModel(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="LLM Model"
                fullWidth
                margin="normal"
              />
            )}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Select a language model for analysis. Different models offer various tradeoffs between speed, cost, and analysis quality.
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Choose Analysts',
      description: 'Select AI analysts to evaluate your stocks',
      content: (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Select analysts to evaluate your stocks
            </Typography>
            <Button size="small" onClick={handleSelectAllAnalysts}>
              {selectedAnalysts.length === analystOptions.length ? 'Deselect All' : 'Select All'}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
            {analystOptions.map((analyst) => (
              <Card 
                key={analyst.value} 
                variant="outlined" 
                sx={{ 
                  borderColor: selectedAnalysts.some(a => a.value === analyst.value) ? 'primary.main' : 'divider',
                  bgcolor: selectedAnalysts.some(a => a.value === analyst.value) ? 'action.selected' : 'transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (selectedAnalysts.some(a => a.value === analyst.value)) {
                    setSelectedAnalysts(selectedAnalysts.filter(a => a.value !== analyst.value));
                  } else {
                    setSelectedAnalysts([...selectedAnalysts, analyst]);
                  }
                }}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle1">{analyst.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{analyst.description}</Typography>
                    </Box>
                    {selectedAnalysts.some(a => a.value === analyst.value) && (
                      <CheckIcon color="primary" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <TextField
            label="Initial Portfolio Cash"
            type="number"
            fullWidth
            margin="normal"
            value={initialCash}
            onChange={(e) => setInitialCash(Number(e.target.value))}
            InputProps={{
              startAdornment: '$',
            }}
          />
          
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={showReasoning}
                  onChange={(e) => setShowReasoning(e.target.checked)}
                />
              }
              label="Show detailed reasoning from each analyst"
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={runRoundTable}
                  onChange={(e) => setRunRoundTable(e.target.checked)}
                />
              }
              label="Run round table discussion after analysis"
            />
          </FormGroup>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock Analysis
      </Typography>
      
      {!isAnalyzing && activeStep < 3 ? (
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="subtitle1">{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    {step.content}
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleStartAnalysis : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={!isStepValid(index)}
                        >
                          {index === steps.length - 1 ? 'Run Analysis' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      ) : activeStep === 3 && analysisResults ? (
        <AnalysisResults 
          results={analysisResults} 
          onNewAnalysis={handleReset} 
        />
      ) : (
        <AnalysisProgress 
          progress={progress} 
          tickers={tickers.split(',').map(t => t.trim())} 
          analysts={selectedAnalysts}
          error={analysisError}
          onCancel={() => {
            setIsAnalyzing(false);
            setProgress({});
          }}
        />
      )}
    </Box>
  );
}

function AnalysisProgress({ progress, tickers, analysts, error, onCancel }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Analysis in Progress</Typography>
          <Button variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {analysts.map(analyst => (
            <Grid item xs={12} md={6} key={analyst.value}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {analyst.label}
                  </Typography>
                  
                  {tickers.map(ticker => {
                    const agentProgress = progress[analyst.value]?.[ticker];
                    
                    return (
                      <Box key={ticker} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{ticker}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {agentProgress?.percent ?? 0}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={agentProgress?.percent ?? 0}
                            />
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {agentProgress?.status ?? 'Waiting...'}
                        </Typography>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

function AnalysisResults({ results, onNewAnalysis }) {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Analysis Results ({results.date})
        </Typography>
        <Button 
          variant="outlined" 
          onClick={onNewAnalysis}
        >
          New Analysis
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {results.tickers.map(ticker => {
          const tickerData = results.signals[ticker];
          const signalColor = 
            tickerData.overallSignal === 'bullish' ? 'success.main' :
            tickerData.overallSignal === 'bearish' ? 'error.main' : 'warning.main';
            
          return (
            <Grid item xs={12} md={6} key={ticker}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{ticker}</Typography>
                    <Chip 
                      label={tickerData.overallSignal.toUpperCase()} 
                      sx={{ 
                        bgcolor: signalColor, 
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Confidence:
                    </Typography>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={tickerData.confidence}
                        color={
                          tickerData.overallSignal === 'bullish' ? 'success' :
                          tickerData.overallSignal === 'bearish' ? 'error' : 'warning'
                        }
                      />
                    </Box>
                    <Typography variant="body2">
                      {tickerData.confidence}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Analyst Signals
                  </Typography>
                  
                  <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                    {tickerData.analysts.map((analyst, index) => {
                      const analystSignalColor = 
                        analyst.signal === 'bullish' ? 'success.main' :
                        analyst.signal === 'bearish' ? 'error.main' : 'warning.main';
                        
                      return (
                        <Box 
                          key={index} 
                          sx={{ 
                            p: 1.5, 
                            borderRadius: 1, 
                            mb: 1,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">
                              {analyst.name}
                            </Typography>
                            <Chip 
                              label={analyst.signal.toUpperCase()} 
                              size="small"
                              sx={{ 
                                bgcolor: analystSignalColor, 
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {analyst.reasoning}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
} 