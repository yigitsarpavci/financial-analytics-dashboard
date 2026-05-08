import pytest
from unittest.mock import MagicMock
from app.services import portfolio

def test_analyze_portfolio_risk_empty():
    mock_db = MagicMock()
    mock_db.query().filter().first.return_value = None
    
    result = portfolio.analyze_portfolio_risk(mock_db, user_id=1)
    
    assert result["allocations"] == {}
    assert result["risk_score"] == 0.0
    assert result["risk_profile"] == "Unknown"
    assert "disclaimer" in result

def test_analyze_portfolio_risk_calculations():
    mock_db = MagicMock()
    
    # Mock Portfolio
    mock_portfolio = MagicMock()
    mock_portfolio.id = 1
    
    # Mock Assets
    asset1 = MagicMock()
    asset1.ticker_symbol = "BTC"
    asset1.asset_class = "Crypto"
    
    asset2 = MagicMock()
    asset2.ticker_symbol = "AAPL"
    asset2.asset_class = "Stocks"
    
    # Mock Holdings (Total value = 1000 + 4000 = 5000)
    # BTC: 20% allocation, Stocks: 80% allocation
    holding1 = MagicMock()
    holding1.quantity = 0.02
    holding1.average_buy_price = 50000.0 # Value: 1000
    holding1.asset = asset1
    
    holding2 = MagicMock()
    holding2.quantity = 20.0
    holding2.average_buy_price = 200.0 # Value: 4000
    holding2.asset = asset2
    
    # Setup mock chain
    mock_query = MagicMock()
    mock_filter = MagicMock()
    mock_join = MagicMock()
    mock_filter2 = MagicMock()
    
    mock_db.query.side_effect = [mock_query, mock_query]
    
    # First query for portfolio
    mock_query.filter.return_value = mock_filter
    mock_filter.first.return_value = mock_portfolio
    
    # Second query for holdings
    mock_query.join.return_value = mock_join
    mock_join.filter.return_value = mock_filter2
    mock_filter2.all.return_value = [holding1, holding2]
    
    result = portfolio.analyze_portfolio_risk(mock_db, user_id=1)
    
    assert result["allocations"]["BTC"] == 20.0
    assert result["allocations"]["AAPL"] == 80.0
    assert result["largest_holding_concentration"] == 80.0
    assert result["asset_type_concentration"]["Stocks"] == 80.0
    
    # Risk calculation: Crypto (90 * 0.2) + Stocks (60 * 0.8) = 18 + 48 = 66
    assert result["risk_score"] == 66.0
    assert result["risk_profile"] == "Balanced"
    assert "disclaimer" in result
