from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Staff(Base):
    """Staff member model"""
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    surname = Column(String(255), nullable=True, index=True)
    role = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    site_links = relationship("SiteStaffLink", back_populates="staff", cascade="all, delete-orphan")
    meetings_chaired = relationship("Meeting", foreign_keys="Meeting.chairperson_staff_id", back_populates="chairperson")
    meeting_items = relationship("MeetingItem", foreign_keys="MeetingItem.person_responsible_staff_id", back_populates="responsible_person")

    def __repr__(self):
        return f"<Staff(id={self.id}, name={self.name}, role={self.role})>"
