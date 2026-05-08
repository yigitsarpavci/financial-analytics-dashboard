from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.all_models import Transaction, TransactionType
from datetime import datetime, timedelta

def get_monthly_summary(db: Session, user_id: int):
    # For a realistic dashboard, let's get the current month's data.
    # To keep the logic simple, we'll get the last 30 days.
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= thirty_days_ago
    ).all()
    
    total_income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
    total_expense = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_savings": net_savings,
        "savings_rate": savings_rate
    }

def get_category_breakdown(db: Session, user_id: int):
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    expenses = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.date >= thirty_days_ago
    ).group_by(Transaction.category).all()
    
    return [{"category": e[0], "amount": float(e[1])} for e in expenses]

def get_cash_flow(db: Session, user_id: int):
    # Group by month for the last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= six_months_ago
    ).all()
    
    monthly_data = {}
    for t in transactions:
        month_key = t.date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {"income": 0.0, "expense": 0.0}
        
        if t.type == TransactionType.INCOME:
            monthly_data[month_key]["income"] += t.amount
        else:
            monthly_data[month_key]["expense"] += t.amount
            
    # Sort and format
    sorted_months = sorted(monthly_data.keys())
    result = []
    for m in sorted_months:
        result.append({
            "month": m,
            "income": monthly_data[m]["income"],
            "expense": monthly_data[m]["expense"]
        })
        
    return result

def get_financial_health_score(db: Session, user_id: int):
    """
    Calculates a simple 0-100 score based on savings rate and expense-to-income ratio.
    """
    summary = get_monthly_summary(db, user_id)
    income = summary["total_income"]
    expense = summary["total_expense"]
    
    score = 50 # Base score
    
    if income > 0:
        savings_rate = summary["savings_rate"]
        # Add up to 30 points for savings rate (target 20%)
        score += min(30, (savings_rate / 20) * 30)
        
        # Deduct if expenses > income
        if expense > income:
            score -= 20
    else:
        score = 10 if expense > 0 else 0
        
    # Cap between 0 and 100
    score = max(0, min(100, score))
    
    status = "Excellent" if score >= 80 else "Good" if score >= 60 else "Fair" if score >= 40 else "Needs Improvement"
    
    return {
        "score": round(score),
        "status": status
    }
