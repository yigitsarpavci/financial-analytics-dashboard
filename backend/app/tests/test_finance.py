import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from app.services import finance
from app.models.all_models import Transaction, TransactionType

def test_get_monthly_summary():
    # Mock the DB session
    mock_db = MagicMock()
    
    # Create fake transactions
    now = datetime.utcnow()
    t1 = Transaction(id=1, user_id=1, amount=5000, type=TransactionType.INCOME, date=now)
    t2 = Transaction(id=2, user_id=1, amount=2000, type=TransactionType.EXPENSE, date=now)
    t3 = Transaction(id=3, user_id=1, amount=1000, type=TransactionType.EXPENSE, date=now)
    
    # Setup mock query chain: db.query().filter().all()
    mock_query = MagicMock()
    mock_filter = MagicMock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_filter
    mock_filter.all.return_value = [t1, t2, t3]
    
    # Call the service function
    result = finance.get_monthly_summary(mock_db, user_id=1)
    
    # Assert calculations
    assert result["total_income"] == 5000
    assert result["total_expense"] == 3000
    assert result["net_savings"] == 2000
    assert result["savings_rate"] == 40.0 # (2000 / 5000) * 100

def test_get_category_breakdown():
    mock_db = MagicMock()
    
    # Breakdown returns a list of tuples: (category, total_amount)
    mock_query = MagicMock()
    mock_filter = MagicMock()
    mock_group_by = MagicMock()
    
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_filter
    mock_filter.group_by.return_value = mock_group_by
    mock_group_by.all.return_value = [("Rent", 1500.0), ("Groceries", 500.0)]
    
    result = finance.get_category_breakdown(mock_db, user_id=1)
    
    assert len(result) == 2
    assert result[0] == {"category": "Rent", "amount": 1500.0}
    assert result[1] == {"category": "Groceries", "amount": 500.0}

def test_get_financial_health_score():
    mock_db = MagicMock()
    
    # Let's mock get_monthly_summary to return a specific dictionary
    original_get_summary = finance.get_monthly_summary
    
    try:
        # Test Case 1: Excellent Health (High Savings)
        finance.get_monthly_summary = MagicMock(return_value={
            "total_income": 10000,
            "total_expense": 4000,
            "net_savings": 6000,
            "savings_rate": 60.0
        })
        res1 = finance.get_financial_health_score(mock_db, user_id=1)
        assert res1["score"] >= 80
        assert res1["status"] == "Excellent"
        
        # Test Case 2: Poor Health (Expenses > Income)
        finance.get_monthly_summary = MagicMock(return_value={
            "total_income": 3000,
            "total_expense": 4000,
            "net_savings": -1000,
            "savings_rate": -33.3
        })
        res2 = finance.get_financial_health_score(mock_db, user_id=1)
        assert res2["score"] < 50
        assert res2["status"] in ["Fair", "Needs Improvement"]
        
    finally:
        # Restore original function
        finance.get_monthly_summary = original_get_summary
