from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class StaffRole(str, enum.Enum):
    """Staff role enumeration for site assignments"""
    SITE_MANAGER = "Site Manager"
    SUPERVISOR = "Supervisor"
    VALVE_TECHNICIAN = "Valve Technician"
    CASUAL_STAFF = "Casual Staff"

class Site(Base):
    """Power station site model"""
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    contact_person = Column(String(255), nullable=True)
    contact_number = Column(String(20), nullable=True)
    contact_email = Column(String(255), nullable=True)
    coordinates = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    staff_links = relationship("SiteStaffLink", back_populates="site", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="site", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Site(id={self.id}, name={self.name})>"


class SiteStaffLink(Base):
    """Many-to-many relationship between sites and staff with role"""
    __tablename__ = "site_staff_links"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # Using String instead of Enum for better SQLite compatibility
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Constraints - unique constraint now includes role
    __table_args__ = (UniqueConstraint("site_id", "staff_id", "role", name="uq_site_staff_role"),)

    # Relationships
    site = relationship("Site", back_populates="staff_links")
    staff = relationship("Staff", back_populates="site_links")

    def __repr__(self):
        return f"<SiteStaffLink(site_id={self.site_id}, staff_id={self.staff_id}, role={self.role})>"
