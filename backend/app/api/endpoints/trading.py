from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.api import deps
from app.models.all_models import User, Order, Trade, Asset
from app.schemas.all_schemas import OrderCreate, OrderRead, TradeRead
from app.services import trading

router = APIRouter()

@router.post("/orders", response_model=OrderRead)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == order_in.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    return trading.place_order(
        db=db,
        user_id=current_user.id,
        asset_id=order_in.asset_id,
        side=order_in.side,
        price=order_in.price,
        quantity=order_in.quantity
    )

@router.get("/orders", response_model=List[OrderRead])
def get_user_orders(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    from sqlalchemy.orm import joinedload
    orders = db.query(Order).options(joinedload(Order.asset)).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    for o in orders:
        if o.asset:
            o.ticker_symbol = o.asset.ticker_symbol
    return orders

@router.get("/order-book")
def get_order_book(
    asset_id: int,
    db: Session = Depends(deps.get_db)
):
    return trading.get_order_book(db, asset_id)

@router.get("/trades", response_model=List[TradeRead])
def get_user_trades(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    from sqlalchemy.orm import joinedload
    trades = db.query(Trade).options(joinedload(Trade.asset)).join(Order, Trade.buy_order_id == Order.id).filter(
        (Order.user_id == current_user.id) | 
        (Trade.sell_order.has(user_id=current_user.id))
    ).order_by(Trade.executed_at.desc()).all()
    
    for t in trades:
        if t.asset:
            t.ticker_symbol = t.asset.ticker_symbol
            
    return trades
