import axios from 'axios';

// Get the API URL from environment variables or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const getModels = async () => {
  try {
    const response = await api.get('/api/models');
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const getAnalysts = async () => {
  try {
    const response = await api.get('/api/analysts');
    return response.data;
  } catch (error) {
    console.error('Error fetching analysts:', error);
    throw error;
  }
};

export const runAnalysis = async (params) => {
  try {
    const response = await api.post('/api/analysis', params);
    return response.data;
  } catch (error) {
    console.error('Error running analysis:', error);
    throw error;
  }
};

export const runBacktest = async (params) => {
  try {
    const response = await api.post('/api/backtest', params);
    return response.data;
  } catch (error) {
    console.error('Error running backtest:', error);
    throw error;
  }
};

export const runRoundTable = async (params) => {
  try {
    const response = await api.post('/api/round-table', params);
    return response.data;
  } catch (error) {
    console.error('Error running round table:', error);
    throw error;
  }
};

export const getEnvConfig = async () => {
  try {
    const response = await api.get('/api/env');
    return response.data;
  } catch (error) {
    console.error('Error fetching environment configuration:', error);
    throw error;
  }
};

export default api; 