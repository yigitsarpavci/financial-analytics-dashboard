from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api import deps
from app.db.session import get_db
from app.models.all_models import Portfolio, PortfolioHolding, Asset, User
from app.schemas.all_schemas import PortfolioHoldingCreate, PortfolioHoldingRead, PortfolioHoldingUpdate, RiskAnalysisResponse
from app.services import portfolio as portfolio_service

router = APIRouter()

def get_or_create_portfolio(db: Session, user_id: int) -> Portfolio:
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user_id, name="Main Portfolio")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio

@router.get("/", response_model=List[PortfolioHoldingRead])
def get_portfolio(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        return []
        
    holdings = db.query(PortfolioHolding).join(Asset).filter(PortfolioHolding.portfolio_id == portfolio.id).all()
    for h in holdings:
        h.ticker_symbol = h.asset.ticker_symbol
        h.asset_class = h.asset.asset_class
        
    return holdings

@router.post("/assets", response_model=PortfolioHoldingRead)
def add_portfolio_asset(
    item: PortfolioHoldingCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    portfolio = get_or_create_portfolio(db, current_user.id)
        
    # Check if asset exists globally
    asset = db.query(Asset).filter(Asset.id == item.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found in the global registry")

    db_item = PortfolioHolding(
        portfolio_id=portfolio.id,
        **item.model_dump()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    # Attach for response
    db_item.ticker_symbol = asset.ticker_symbol
    db_item.asset_class = asset.asset_class
    
    return db_item

@router.put("/assets/{holding_id}", response_model=PortfolioHoldingRead)
def update_portfolio_asset(
    holding_id: int,
    item_in: PortfolioHoldingUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id, 
        PortfolioHolding.portfolio_id == portfolio.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(holding, field, value)
        
    db.add(holding)
    db.commit()
    db.refresh(holding)
    
    # Re-fetch asset info
    asset = db.query(Asset).filter(Asset.id == holding.asset_id).first()
    holding.ticker_symbol = asset.ticker_symbol
    holding.asset_class = asset.asset_class
    
    return holding

@router.delete("/assets/{holding_id}")
def delete_portfolio_asset(
    holding_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id, 
        PortfolioHolding.portfolio_id == portfolio.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    db.delete(holding)
    db.commit()
    return {"detail": "Holding deleted"}

@router.get("/allocation")
def get_allocation(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    analysis = portfolio_service.analyze_portfolio_risk(db, current_user.id)
    return analysis["allocations"]

@router.get("/risk-analysis", response_model=RiskAnalysisResponse)
def get_risk_analysis(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    analysis = portfolio_service.analyze_portfolio_risk(db, current_user.id)
    return analysis
