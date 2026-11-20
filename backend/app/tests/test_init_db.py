from sqlalchemy import create_engine, inspect
from sqlalchemy.pool import StaticPool

from app.db.init_db import init_db

EXPECTED = {
    "users", "transactions", "budgets", "assets", "portfolios",
    "portfolio_holdings", "risk_analysis_results", "ai_insights", "orders", "trades",
}


def test_init_db_creates_the_ten_tables_and_is_idempotent():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    init_db(engine)
    init_db(engine)
    assert EXPECTED <= set(inspect(engine).get_table_names())
