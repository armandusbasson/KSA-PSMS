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
            # Remove internal reference columns if they exist (cleanup migration)
            if 'internal_quotation_number' in cols4:
                # SQLite doesn't support DROP COLUMN directly, so we skip it for SQLite
                # but we note that the column exists and won't be used
                pass
            if 'internal_invoice_number' in cols4:
                pass
            # Add role column to site_staff_links table for role-based staff assignments
            res5 = conn.execute(text("PRAGMA table_info('site_staff_links')")).fetchall()
            cols5 = [r[1] for r in res5]
            if 'role' not in cols5:
                conn.execute(text("ALTER TABLE site_staff_links ADD COLUMN role VARCHAR(50)"))
                # Update existing rows to have a role value (use the enum value)
                conn.execute(text("UPDATE site_staff_links SET role = 'Site Manager' WHERE role IS NULL"))


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
            # Remove internal reference columns from PostgreSQL/MySQL
            try:
                conn.execute(text("ALTER TABLE contracts DROP COLUMN IF EXISTS internal_quotation_number"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE contracts DROP COLUMN IF EXISTS internal_invoice_number"))
            except Exception:
                pass
    finally:
        conn.close()
