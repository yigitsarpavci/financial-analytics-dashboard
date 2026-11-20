// Response and request shapes of the FastAPI backend (see backend/app/schemas/all_schemas.py).

export type TransactionType = "INCOME" | "EXPENSE";
export type OrderSide = "BUY" | "SELL";
export type OrderStatus = "OPEN" | "FILLED" | "CANCELED" | "REJECTED";

export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string | null;
  date: string;
  created_at: string;
}

export interface TransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date?: string;
}

export interface PortfolioHolding {
  id: number;
  portfolio_id: number;
  asset_id: number;
  quantity: number;
  average_buy_price: number;
  allocation_percentage: number;
  ticker_symbol?: string | null;
  asset_class?: string | null;
}

export interface PortfolioAssetInput {
  asset_id: number;
  quantity: number;
  average_buy_price: number;
  allocation_percentage?: number;
}

export interface RiskAnalysis {
  allocations: Record<string, number>;
  largest_holding_concentration: number;
  asset_type_concentration: Record<string, number>;
  diversification_score: number;
  risk_score: number;
  risk_profile: string;
  explanation: string;
  disclaimer: string;
}

export interface AIInsight {
  id: number;
  user_id: number;
  prompt?: string | null;
  insight: string;
  generated_at: string;
}

export interface MonthlySummary {
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
}

export interface CashFlowPoint {
  month: string;
  income: number;
  expense: number;
}

export interface HealthScore {
  score: number;
  status: string;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface Order {
  id: number;
  user_id: number;
  asset_id: number;
  side: OrderSide;
  price: number;
  quantity: number;
  filled_quantity: number;
  status: OrderStatus;
  created_at: string;
  ticker_symbol?: string | null;
}

export interface OrderInput {
  asset_id: number;
  side: OrderSide;
  price: number;
  quantity: number;
}

export interface Trade {
  id: number;
  buy_order_id: number;
  sell_order_id: number;
  asset_id: number;
  price: number;
  quantity: number;
  executed_at: string;
  ticker_symbol?: string | null;
}
