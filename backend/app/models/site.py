from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

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
    """Many-to-many relationship between sites and staff"""
    __tablename__ = "site_staff_links"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Constraints
    __table_args__ = (UniqueConstraint("site_id", "staff_id", name="uq_site_staff"),)

    # Relationships
    site = relationship("Site", back_populates="staff_links")
    staff = relationship("Staff", back_populates="site_links")

    def __repr__(self):
        return f"<SiteStaffLink(site_id={self.site_id}, staff_id={self.staff_id})>"
