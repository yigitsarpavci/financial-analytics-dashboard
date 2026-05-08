import pytest
from unittest.mock import MagicMock, patch
from app.services.ai import AIFinancialService, DISCLAIMER

def test_financial_summary_fallback():
    service = AIFinancialService()
    service.use_llm = False # Force fallback
    
    mock_db = MagicMock()
    
    with patch("app.services.ai.finance.get_monthly_summary") as mock_summary, \
         patch("app.services.ai.finance.get_category_breakdown") as mock_categories:
        
        mock_summary.return_value = {
            "total_income": 5000.0,
            "total_expense": 3000.0,
            "savings_rate": 40.0
        }
        mock_categories.return_value = [
            {"category": "Rent", "amount": 1500.0},
            {"category": "Groceries", "amount": 500.0}
        ]
        
        result = service.get_financial_summary(mock_db, user_id=1)
        
        assert "income is $5000.00" in result
        assert "savings rate of 40.0%" in result
        assert "Rent: $1500.00" in result
        assert DISCLAIMER in result
        assert mock_db.add.called
        assert mock_db.commit.called

def test_portfolio_risk_summary_fallback():
    service = AIFinancialService()
    service.use_llm = False
    
    mock_db = MagicMock()
    
    with patch("app.services.ai.portfolio.analyze_portfolio_risk") as mock_risk:
        mock_risk.return_value = {
            "allocations": {"BTC": 100.0},
            "risk_score": 90.0,
            "risk_profile": "Aggressive",
            "largest_holding_concentration": 100.0
        }
        
        result = service.get_portfolio_risk_summary(mock_db, user_id=1)
        
        assert "Aggressive" in result
        assert "90.0/100" in result
        assert "100.0%" in result
        assert DISCLAIMER in result

def test_monthly_report_fallback():
    service = AIFinancialService()
    service.use_llm = False
    
    mock_db = MagicMock()
    
    with patch("app.services.ai.finance.get_financial_health_score") as mock_health:
        mock_health.return_value = {
            "score": 85,
            "status": "Excellent"
        }
        
        result = service.get_monthly_report(mock_db, user_id=1)
        
        assert "85/100" in result
        assert "Excellent" in result
        assert DISCLAIMER in result
