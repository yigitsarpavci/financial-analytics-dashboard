from fastapi import APIRouter
from app.api.endpoints import transactions, portfolio, ai, auth, finance, trading

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(finance.router, prefix="/finance", tags=["Finance"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Assistant"])
api_router.include_router(trading.router, prefix="/trading", tags=["Trading Simulator"])
