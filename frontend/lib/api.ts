import type {
  AIInsight,
  CashFlowPoint,
  CategoryBreakdownItem,
  HealthScore,
  MonthlySummary,
  Order,
  OrderBook,
  OrderInput,
  PortfolioAssetInput,
  PortfolioHolding,
  RiskAnalysis,
  Trade,
  Transaction,
  TransactionInput,
  User,
} from "@/types/api";

export const fetchAPI = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
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
    if (response.status === 401 || response.status === 403 || response.status === 404) {
      throw new Error("Unauthorized");
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

export const getTransactions = async () => {
  return fetchAPI<Transaction[]>(`/transactions/`);
};

export const getPortfolio = async () => fetchAPI<PortfolioHolding[]>(`/portfolio/`);
export const getPortfolioRiskAnalysis = async () => fetchAPI<RiskAnalysis>(`/portfolio/risk-analysis`);

export const addPortfolioAsset = async (data: PortfolioAssetInput) => {
  return fetchAPI<PortfolioHolding>(`/portfolio/assets`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updatePortfolioAsset = async (id: number, data: Partial<PortfolioAssetInput>) => {
  return fetchAPI<PortfolioHolding>(`/portfolio/assets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deletePortfolioAsset = async (id: number) => {
  return fetchAPI(`/portfolio/assets/${id}`, {
    method: 'DELETE'
  });
};

export const getPreviousInsights = async () => fetchAPI<AIInsight[]>(`/ai/insights`);

export const generateFinancialSummary = async () => {
  return fetchAPI(`/ai/financial-summary`, { method: 'POST' });
};

export const generatePortfolioRiskSummary = async () => {
  return fetchAPI(`/ai/portfolio-risk-summary`, { method: 'POST' });
};

export const generateMonthlyReport = async () => {
  return fetchAPI(`/ai/monthly-report`, { method: 'POST' });
};

export const getCurrentUser = async () => fetchAPI<User>('/auth/me');

export const getMonthlySummary = async () => fetchAPI<MonthlySummary>('/finance/monthly-summary');
export const getCategoryBreakdown = async () => fetchAPI<CategoryBreakdownItem[]>('/finance/category-breakdown');
export const getCashFlow = async () => fetchAPI<CashFlowPoint[]>('/finance/cash-flow');
export const getHealthScore = async () => fetchAPI<HealthScore>('/finance/financial-health-score');

export const createTransaction = async (data: TransactionInput) => {
  return fetchAPI<Transaction>('/transactions/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const createOrder = async (data: OrderInput) => {
  return fetchAPI<Order>('/trading/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getUserOrders = async () => fetchAPI<Order[]>('/trading/orders');
export const getOrderBook = async (assetId: number = 1) => fetchAPI<OrderBook>(`/trading/order-book?asset_id=${assetId}`);
export const getUserTrades = async () => fetchAPI<Trade[]>('/trading/trades');
