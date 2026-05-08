from sqlalchemy.orm import Session
from app.models.all_models import Order, Trade, OrderSide, OrderStatus

def place_order(db: Session, user_id: int, asset_id: int, side: OrderSide, price: float, quantity: float):
    # Create the new order
    new_order = Order(
        user_id=user_id,
        asset_id=asset_id,
        side=side,
        price=price,
        quantity=quantity,
        filled_quantity=0.0,
        status=OrderStatus.OPEN
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Run matching engine
    _match_order(db, new_order)
    
    return new_order

def _match_order(db: Session, order: Order):
    if order.status != OrderStatus.OPEN:
        return
        
    remaining_qty = order.quantity - order.filled_quantity
    
    while remaining_qty > 0:
        # Find best opposite order
        if order.side == OrderSide.BUY:
            # For a buy, we want the lowest sell price that is <= our buy price
            opposite_order = db.query(Order).filter(
                Order.asset_id == order.asset_id,
                Order.side == OrderSide.SELL,
                Order.status == OrderStatus.OPEN,
                Order.price <= order.price
            ).order_by(Order.price.asc(), Order.created_at.asc()).first()
        else:
            # For a sell, we want the highest buy price that is >= our sell price
            opposite_order = db.query(Order).filter(
                Order.asset_id == order.asset_id,
                Order.side == OrderSide.BUY,
                Order.status == OrderStatus.OPEN,
                Order.price >= order.price
            ).order_by(Order.price.desc(), Order.created_at.asc()).first()
            
        if not opposite_order:
            break # No match found
            
        opposite_remaining = opposite_order.quantity - opposite_order.filled_quantity
        trade_qty = min(remaining_qty, opposite_remaining)
        
        # Execution price is the resting order's price (maker's price)
        execution_price = opposite_order.price
        
        # Update quantities
        order.filled_quantity += trade_qty
        opposite_order.filled_quantity += trade_qty
        remaining_qty -= trade_qty
        
        # Update statuses
        if order.filled_quantity >= order.quantity:
            order.status = OrderStatus.FILLED
        if opposite_order.filled_quantity >= opposite_order.quantity:
            opposite_order.status = OrderStatus.FILLED
            
        # Create Trade
        trade = Trade(
            buy_order_id=order.id if order.side == OrderSide.BUY else opposite_order.id,
            sell_order_id=opposite_order.id if order.side == OrderSide.BUY else order.id,
            asset_id=order.asset_id,
            price=execution_price,
            quantity=trade_qty
        )
        db.add(trade)
        
        # Commit partial fill or full fill iteration
        db.commit()
        db.refresh(order)

def get_order_book(db: Session, asset_id: int):
    # Group and sum quantities by price
    from sqlalchemy import func
    
    bids = db.query(Order.price, func.sum(Order.quantity - Order.filled_quantity).label("total_qty")).filter(
        Order.asset_id == asset_id,
        Order.side == OrderSide.BUY,
        Order.status == OrderStatus.OPEN
    ).group_by(Order.price).order_by(Order.price.desc()).all()
    
    asks = db.query(Order.price, func.sum(Order.quantity - Order.filled_quantity).label("total_qty")).filter(
        Order.asset_id == asset_id,
        Order.side == OrderSide.SELL,
        Order.status == OrderStatus.OPEN
    ).group_by(Order.price).order_by(Order.price.asc()).all()
    
    return {
        "bids": [{"price": float(b[0]), "quantity": float(b[1])} for b in bids],
        "asks": [{"price": float(a[0]), "quantity": float(a[1])} for a in asks]
    }
