from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User
from app.services import finance

router = APIRouter()

@router.get("/monthly-summary")
def get_monthly_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return finance.get_monthly_summary(db, current_user.id)

@router.get("/category-breakdown")
def get_category_breakdown(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return finance.get_category_breakdown(db, current_user.id)

@router.get("/cash-flow")
def get_cash_flow(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return finance.get_cash_flow(db, current_user.id)

@router.get("/financial-health-score")
def get_financial_health_score(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return finance.get_financial_health_score(db, current_user.id)
