from sqlalchemy.engine import Engine

from app.models import all_models  # noqa: F401  (registers every table on Base)
from app.models.all_models import Base


def init_db(engine: Engine) -> None:
    """Create any missing tables so a fresh database works without a manual migration step."""
    Base.metadata.create_all(bind=engine)
