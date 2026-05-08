import os
from sqlalchemy.orm import Session
from app.models.all_models import AIInsight
from app.services import finance, portfolio
from app.core.config import settings

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

DISCLAIMER = "Educational Observation Only. This does not constitute financial advice. Please exercise risk awareness."

class AIFinancialService:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY", getattr(settings, "OPENAI_API_KEY", None))
        self.use_llm = OpenAI is not None and self.api_key and self.api_key != "sk-your-openai-api-key"
        if self.use_llm:
            self.client = OpenAI(api_key=self.api_key)

    def _generate_with_llm(self, system_prompt: str, user_prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM API Error: {e}")
            return None

    def _save_insight(self, db: Session, user_id: int, prompt_used: str, insight_text: str):
        insight = AIInsight(user_id=user_id, prompt=prompt_used, insight=insight_text)
        db.add(insight)
        db.commit()

    def get_financial_summary(self, db: Session, user_id: int) -> str:
        summary = finance.get_monthly_summary(db, user_id)
        categories = finance.get_category_breakdown(db, user_id)
        
        cat_str = ", ".join([f"{c['category']}: ${c['amount']:.2f}" for c in categories])
        
        user_prompt = f"Income: ${summary['total_income']}, Expenses: ${summary['total_expense']}, Savings Rate: {summary['savings_rate']:.1f}%. Top spending: {cat_str}."
        system_prompt = "You are a financial educator. Provide an educational observation on the user's spending habits. Do not give financial advice."

        if self.use_llm:
            result = self._generate_with_llm(system_prompt, user_prompt)
            if result:
                final = f"{result}\n\n{DISCLAIMER}"
                self._save_insight(db, user_id, "financial-summary", final)
                return final

        # Fallback
        result = (
            f"Based on your recent data, your income is ${summary['total_income']:.2f} and your expenses are ${summary['total_expense']:.2f}. "
            f"This gives you a savings rate of {summary['savings_rate']:.1f}%. "
            f"Your major spending categories include {cat_str}. "
            f"As an educational observation, maintaining a positive savings rate helps build a financial buffer."
        )
        final = f"{result}\n\n{DISCLAIMER}"
        self._save_insight(db, user_id, "financial-summary (fallback)", final)
        return final

    def get_portfolio_risk_summary(self, db: Session, user_id: int) -> str:
        risk_data = portfolio.analyze_portfolio_risk(db, user_id)
        
        user_prompt = f"Allocations: {risk_data['allocations']}. Risk Score: {risk_data['risk_score']}. Profile: {risk_data['risk_profile']}. Largest holding: {risk_data['largest_holding_concentration']}%."
        system_prompt = "You are a risk awareness educator. Analyze the user's portfolio risk and diversification. Do not tell them what to buy or sell."

        if self.use_llm:
            result = self._generate_with_llm(system_prompt, user_prompt)
            if result:
                final = f"{result}\n\n{DISCLAIMER}"
                self._save_insight(db, user_id, "portfolio-risk-summary", final)
                return final

        # Fallback
        result = (
            f"Your portfolio is categorized as {risk_data['risk_profile']} with a risk score of {risk_data['risk_score']:.1f}/100. "
            f"Your largest holding constitutes {risk_data['largest_holding_concentration']:.1f}% of your portfolio. "
            f"Risk awareness note: Highly concentrated portfolios carry specific asset risks. Diversification is a common strategy to mitigate this."
        )
        final = f"{result}\n\n{DISCLAIMER}"
        self._save_insight(db, user_id, "portfolio-risk-summary (fallback)", final)
        return final

    def get_monthly_report(self, db: Session, user_id: int) -> str:
        health = finance.get_financial_health_score(db, user_id)
        
        user_prompt = f"Health Score: {health['score']}/100. Status: {health['status']}."
        system_prompt = "You are a financial educator. Write a brief monthly educational review based on the health score."

        if self.use_llm:
            result = self._generate_with_llm(system_prompt, user_prompt)
            if result:
                final = f"{result}\n\n{DISCLAIMER}"
                self._save_insight(db, user_id, "monthly-report", final)
                return final

        # Fallback
        result = (
            f"Your overall financial health score this month is {health['score']}/100, which is considered {health['status']}. "
            f"Educational observation: Consistency in budgeting and portfolio monitoring generally leads to improved long-term financial health."
        )
        final = f"{result}\n\n{DISCLAIMER}"
        self._save_insight(db, user_id, "monthly-report (fallback)", final)
        return final

ai_service = AIFinancialService()
