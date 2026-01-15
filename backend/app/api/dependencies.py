from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db

# Reusable dependencies
def get_database() -> Session:
    """Get database session"""
    return get_db
