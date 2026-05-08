export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("auth_token");
    if (token) {
      (defaultOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }
    
  const response = await fetch(`${API_URL}/api/v1${endpoint}`, { ...defaultOptions, ...options });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const getTransactions = async () => {
  return fetchAPI(`/transactions/`);
};

export const getPortfolio = async () => fetchAPI(`/portfolio/`);
export const getPortfolioRiskAnalysis = async () => fetchAPI(`/portfolio/risk-analysis`);

export const addPortfolioAsset = async (data: any) => {
  return fetchAPI(`/portfolio/assets`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updatePortfolioAsset = async (id: number, data: any) => {
  return fetchAPI(`/portfolio/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deletePortfolioAsset = async (id: number) => {
  return fetchAPI(`/portfolio/assets/${id}`, {
    method: 'DELETE'
  });
};

export const getPreviousInsights = async () => fetchAPI(`/ai/insights`);

export const generateFinancialSummary = async () => {
  return fetchAPI(`/ai/financial-summary`, { method: 'POST' });
};

export const generatePortfolioRiskSummary = async () => {
  return fetchAPI(`/ai/portfolio-risk-summary`, { method: 'POST' });
};

export const generateMonthlyReport = async () => {
  return fetchAPI(`/ai/monthly-report`, { method: 'POST' });
};

export const getCurrentUser = async () => fetchAPI('/auth/me');

export const getMonthlySummary = async () => fetchAPI('/finance/monthly-summary');
export const getCategoryBreakdown = async () => fetchAPI('/finance/category-breakdown');
export const getCashFlow = async () => fetchAPI('/finance/cash-flow');
export const getHealthScore = async () => fetchAPI('/finance/financial-health-score');

export const createTransaction = async (data: any) => {
  return fetchAPI('/transactions/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const createOrder = async (data: any) => {
  return fetchAPI('/trading/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getUserOrders = async () => fetchAPI('/trading/orders');
export const getOrderBook = async (assetId: number = 1) => fetchAPI(`/trading/order-book?asset_id=${assetId}`);
export const getUserTrades = async () => fetchAPI('/trading/trades');
