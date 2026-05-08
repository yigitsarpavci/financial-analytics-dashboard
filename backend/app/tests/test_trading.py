import pytest
from app.services.trading import _match_order
from app.models.all_models import Order, Trade, OrderSide, OrderStatus
from unittest.mock import MagicMock

def test_match_order_no_match():
    mock_db = MagicMock()
    order = Order(id=1, asset_id=1, side=OrderSide.BUY, price=100.0, quantity=10.0, filled_quantity=0.0, status=OrderStatus.OPEN)
    
    # Mock query returning no opposite orders
    mock_query = MagicMock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.first.return_value = None
    
    _match_order(mock_db, order)
    
    assert order.filled_quantity == 0.0
    assert order.status == OrderStatus.OPEN
    assert not mock_db.add.called

def test_match_order_full_match():
    mock_db = MagicMock()
    
    # New Buy Order
    buy_order = Order(id=1, asset_id=1, side=OrderSide.BUY, price=100.0, quantity=10.0, filled_quantity=0.0, status=OrderStatus.OPEN)
    
    # Resting Sell Order
    sell_order = Order(id=2, asset_id=1, side=OrderSide.SELL, price=90.0, quantity=10.0, filled_quantity=0.0, status=OrderStatus.OPEN)
    
    # Mock query returning the sell order, then None (to exit loop)
    mock_query = MagicMock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.first.side_effect = [sell_order, None]
    
    _match_order(mock_db, buy_order)
    
    assert buy_order.filled_quantity == 10.0
    assert buy_order.status == OrderStatus.FILLED
    assert sell_order.filled_quantity == 10.0
    assert sell_order.status == OrderStatus.FILLED
    assert mock_db.add.called # Trade record created

def test_match_order_partial_match():
    mock_db = MagicMock()
    
    # New Buy Order (wants 10)
    buy_order = Order(id=1, asset_id=1, side=OrderSide.BUY, price=100.0, quantity=10.0, filled_quantity=0.0, status=OrderStatus.OPEN)
    
    # Resting Sell Order (only has 4)
    sell_order = Order(id=2, asset_id=1, side=OrderSide.SELL, price=90.0, quantity=4.0, filled_quantity=0.0, status=OrderStatus.OPEN)
    
    # Mock query returning the sell order, then None
    mock_query = MagicMock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.first.side_effect = [sell_order, None]
    
    _match_order(mock_db, buy_order)
    
    assert buy_order.filled_quantity == 4.0
    assert buy_order.status == OrderStatus.OPEN # Still open
    assert sell_order.filled_quantity == 4.0
    assert sell_order.status == OrderStatus.FILLED # Filled

def test_match_order_price_time_priority():
    mock_db = MagicMock()
    
    # New Sell Order (selling 10 at $90)
    sell_order = Order(id=1, asset_id=1, side=OrderSide.SELL, price=90.0, quantity=10.0, filled_quantity=0.0, status=OrderStatus.OPEN)
    
    # Two resting buy orders
    buy_order_1 = Order(id=2, asset_id=1, side=OrderSide.BUY, price=100.0, quantity=5.0, filled_quantity=0.0, status=OrderStatus.OPEN) # Better price
    buy_order_2 = Order(id=3, asset_id=1, side=OrderSide.BUY, price=95.0, quantity=5.0, filled_quantity=0.0, status=OrderStatus.OPEN)  # Worse price
    
    mock_query = MagicMock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    # Return buy_order_1 first, then buy_order_2, then None
    mock_query.first.side_effect = [buy_order_1, buy_order_2, None]
    
    _match_order(mock_db, sell_order)
    
    assert sell_order.filled_quantity == 10.0
    assert sell_order.status == OrderStatus.FILLED
    assert buy_order_1.status == OrderStatus.FILLED
    assert buy_order_2.status == OrderStatus.FILLED
    assert mock_db.add.call_count == 2 # 2 trades created
