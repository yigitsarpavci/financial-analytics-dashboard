from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models.all_models import TransactionType, OrderSide, OrderStatus

# --- User ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Transaction ---
class TransactionBase(BaseModel):
    amount: float
    type: TransactionType
    category: str
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionRead(TransactionBase):
    id: int
    user_id: int
    date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Budget ---
class BudgetBase(BaseModel):
    category: str
    target_amount: float
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Asset ---
class AssetBase(BaseModel):
    ticker_symbol: str
    name: str
    asset_class: str

class AssetCreate(AssetBase):
    pass

class AssetRead(AssetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Portfolio & Holdings ---
class PortfolioBase(BaseModel):
    name: str

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioRead(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PortfolioHoldingBase(BaseModel):
    asset_id: int
    quantity: float
    average_buy_price: float
    allocation_percentage: float

class PortfolioHoldingCreate(PortfolioHoldingBase):
    pass

class PortfolioHoldingUpdate(BaseModel):
    quantity: Optional[float] = None
    average_buy_price: Optional[float] = None
    allocation_percentage: Optional[float] = None

class PortfolioHoldingRead(PortfolioHoldingBase):
    id: int
    portfolio_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    ticker_symbol: Optional[str] = None
    asset_class: Optional[str] = None

    class Config:
        from_attributes = True

# --- Risk Analysis Result ---
class RiskAnalysisResultBase(BaseModel):
    risk_score: float
    risk_profile: str
    details: Optional[str] = None

class RiskAnalysisResultCreate(RiskAnalysisResultBase):
    pass

class RiskAnalysisResultRead(RiskAnalysisResultBase):
    id: int
    portfolio_id: int
    calculated_at: datetime

    class Config:
        from_attributes = True

class RiskAnalysisResponse(BaseModel):
    allocations: dict
    largest_holding_concentration: float
    asset_type_concentration: dict
    diversification_score: float
    risk_score: float
    risk_profile: str
    explanation: str
    disclaimer: str = "This is for educational purposes only and does not constitute financial advice."

# --- AI Insight ---
class AIInsightBase(BaseModel):
    prompt: Optional[str] = None
    insight: str

class AIInsightCreate(AIInsightBase):
    pass

class AIInsightRead(AIInsightBase):
    id: int
    user_id: int
    generated_at: datetime

    class Config:
        from_attributes = True

class AIInsightRequest(BaseModel):
    prompt: str = ""

class AIInsightResponse(BaseModel):
    insight: str

# --- Order & Trade ---
class OrderBase(BaseModel):
    asset_id: int
    side: OrderSide
    price: float
    quantity: float

class OrderCreate(OrderBase):
    pass

class OrderRead(OrderBase):
    id: int
    user_id: int
    filled_quantity: float
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    ticker_symbol: Optional[str] = None

    class Config:
        from_attributes = True

class TradeRead(BaseModel):
    id: int
    buy_order_id: int
    sell_order_id: int
    asset_id: int
    price: float
    quantity: float
    executed_at: datetime
    
    ticker_symbol: Optional[str] = None

    class Config:
        from_attributes = True
