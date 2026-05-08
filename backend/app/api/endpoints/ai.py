from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import AIInsightResponse
from app.services.ai import ai_service

router = APIRouter()

@router.post("/financial-summary", response_model=AIInsightResponse)
def financial_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    insight = ai_service.get_financial_summary(db, current_user.id)
    return AIInsightResponse(insight=insight)

@router.post("/portfolio-risk-summary", response_model=AIInsightResponse)
def portfolio_risk_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    insight = ai_service.get_portfolio_risk_summary(db, current_user.id)
    return AIInsightResponse(insight=insight)

@router.post("/monthly-report", response_model=AIInsightResponse)
def monthly_report(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    insight = ai_service.get_monthly_report(db, current_user.id)
    return AIInsightResponse(insight=insight)

from typing import List
from app.models.all_models import AIInsight
from app.schemas.all_schemas import AIInsightRead

@router.get("/insights", response_model=List[AIInsightRead])
def get_insights(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return db.query(AIInsight).filter(AIInsight.user_id == current_user.id).order_by(AIInsight.generated_at.desc()).limit(10).all()
