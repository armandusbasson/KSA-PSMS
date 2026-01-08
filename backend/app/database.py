from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables and apply lightweight migrations"""
    Base.metadata.create_all(bind=engine)

    # Ensure new columns are added for backwards compatibility (SQLite doesn't alter tables via SQLAlchemy)
    from sqlalchemy import text
    conn = engine.connect()
    try:
        if "sqlite" in str(engine.url):
            res = conn.execute(text("PRAGMA table_info('staff')")).fetchall()
            cols = [r[1] for r in res]
            if 'surname' not in cols:
                conn.execute(text("ALTER TABLE staff ADD COLUMN surname VARCHAR(255)") )
            # Ensure meetings.scheduled_at exists
            res2 = conn.execute(text("PRAGMA table_info('meetings')")).fetchall()
            cols2 = [r[1] for r in res2]
            if 'scheduled_at' not in cols2:
                conn.execute(text("ALTER TABLE meetings ADD COLUMN scheduled_at DATETIME"))
            # Migrate sites table columns
            res3 = conn.execute(text("PRAGMA table_info('sites')")).fetchall()
            cols3 = [r[1] for r in res3]
            if 'contact_person' not in cols3:
                conn.execute(text("ALTER TABLE sites ADD COLUMN contact_person VARCHAR(255)"))
            if 'contact_number' not in cols3:
                conn.execute(text("ALTER TABLE sites ADD COLUMN contact_number VARCHAR(20)"))
            if 'contact_email' not in cols3:
                conn.execute(text("ALTER TABLE sites ADD COLUMN contact_email VARCHAR(255)"))
            if 'coordinates' not in cols3:
                conn.execute(text("ALTER TABLE sites ADD COLUMN coordinates VARCHAR(255)"))
            # Ensure contracts.notes and contract_value exist
            res4 = conn.execute(text("PRAGMA table_info('contracts')")).fetchall()
            cols4 = [r[1] for r in res4]
            if 'notes' not in cols4:
                conn.execute(text("ALTER TABLE contracts ADD COLUMN notes TEXT"))
            if 'contract_value' not in cols4:
                conn.execute(text("ALTER TABLE contracts ADD COLUMN contract_value DECIMAL(15, 2)"))
        else:
            # Generic alter try - may succeed on Postgres/MySQL if column doesn't exist
            try:
                conn.execute(text("ALTER TABLE staff ADD COLUMN surname VARCHAR(255)"))
            except Exception:
                # If column exists or DB doesn't support, ignore
                pass
            try:
                conn.execute(text("ALTER TABLE meetings ADD COLUMN scheduled_at TIMESTAMP"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE sites ADD COLUMN contact_person VARCHAR(255)"))
                conn.execute(text("ALTER TABLE sites ADD COLUMN contact_number VARCHAR(20)"))
                conn.execute(text("ALTER TABLE sites ADD COLUMN contact_email VARCHAR(255)"))
                conn.execute(text("ALTER TABLE sites ADD COLUMN coordinates VARCHAR(255)"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE contracts ADD COLUMN notes TEXT"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE contracts ADD COLUMN contract_value DECIMAL(15, 2)"))
            except Exception:
                pass
    finally:
        conn.close()
