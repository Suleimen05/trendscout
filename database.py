import os
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_URL = os.getenv("DATABASE_URL", "sqlite:///trendscout.db")

Base = declarative_base()


class Trend(Base):
    __tablename__ = "trends"

    id = Column(Integer, primary_key=True)
    run_id = Column(String, index=True)
    vertical = Column(String)
    platform = Column(String)
    url = Column(String, unique=True)
    description = Column(Text)
    stats = Column(JSON)
    uts_score = Column(Float)
    ai_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db_session():
    """Return a SQLAlchemy session, creating tables if needed."""
    engine = create_engine(DB_URL, echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()
