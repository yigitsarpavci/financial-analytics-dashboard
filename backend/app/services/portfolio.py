from sqlalchemy.orm import Session
from app.models.all_models import Portfolio, PortfolioHolding, Asset

# Mock risk weights out of 100
RISK_WEIGHTS = {
    "Crypto": 90.0,
    "Stocks": 60.0,
    "ETFs": 50.0,
    "Real Estate": 50.0,
    "Commodities": 45.0,
    "Bonds": 30.0,
    "Cash": 10.0
}

def analyze_portfolio_risk(db: Session, user_id: int):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio:
        return _empty_risk_response()

    holdings = db.query(PortfolioHolding).join(Asset).filter(PortfolioHolding.portfolio_id == portfolio.id).all()
    if not holdings:
        return _empty_risk_response()

    total_value = sum(h.quantity * h.average_buy_price for h in holdings)
    
    # Recalculate allocations based on current DB values to be safe
    allocations = {}
    asset_type_concentration = {}
    weighted_risk = 0.0
    
    for h in holdings:
        perc = (h.quantity * h.average_buy_price) / total_value * 100 if total_value > 0 else 0
        ticker = h.asset.ticker_symbol
        a_class = h.asset.asset_class
        
        allocations[ticker] = perc
        asset_type_concentration[a_class] = asset_type_concentration.get(a_class, 0.0) + perc
        
        weight = RISK_WEIGHTS.get(a_class, 50.0)
        weighted_risk += weight * (perc / 100.0)

    largest_holding = max(allocations.values()) if allocations else 0.0
    
    # Diversification Score (0-100)
    # Penalize if few assets or highly concentrated
    num_assets = len(holdings)
    div_score = min(100.0, num_assets * 10.0) # Base 10 pts per asset
    if largest_holding > 50.0:
        div_score -= 20.0
    elif largest_holding > 30.0:
        div_score -= 10.0
    div_score = max(0.0, min(100.0, div_score))

    # Risk Profile
    if weighted_risk > 75:
        profile = "Aggressive"
    elif weighted_risk > 45:
        profile = "Balanced"
    else:
        profile = "Conservative"

    # Explanation
    explanation = (
        f"Your portfolio consists of {num_assets} assets with a total value of ${total_value:,.2f}. "
        f"Your largest holding makes up {largest_holding:.1f}% of your portfolio. "
        f"Based on your asset classes ({', '.join(asset_type_concentration.keys())}), "
        f"your overall risk score is {weighted_risk:.1f}/100, aligning with a {profile} risk profile."
    )

    return {
        "allocations": allocations,
        "largest_holding_concentration": largest_holding,
        "asset_type_concentration": asset_type_concentration,
        "diversification_score": div_score,
        "risk_score": weighted_risk,
        "risk_profile": profile,
        "explanation": explanation,
        "disclaimer": "This is for educational purposes only and does not constitute financial advice."
    }

def _empty_risk_response():
    return {
        "allocations": {},
        "largest_holding_concentration": 0.0,
        "asset_type_concentration": {},
        "diversification_score": 0.0,
        "risk_score": 0.0,
        "risk_profile": "Unknown",
        "explanation": "No portfolio data available.",
        "disclaimer": "This is for educational purposes only and does not constitute financial advice."
    }
