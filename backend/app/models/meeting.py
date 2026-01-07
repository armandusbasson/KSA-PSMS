from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Meeting(Base):
    """Meeting model linked to a site"""
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    agenda = Column(Text, nullable=True)
    attendees = Column(Text, nullable=True)
    apologies = Column(Text, nullable=True)
    chairperson_staff_id = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True, index=True)
    introduction = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    site = relationship("Site", back_populates="meetings")
    chairperson = relationship("Staff", foreign_keys=[chairperson_staff_id], back_populates="meetings_chaired")
    items = relationship("MeetingItem", back_populates="meeting", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Meeting(id={self.id}, site_id={self.site_id})>"


class MeetingItem(Base):
    """Individual agenda item within a meeting"""
    __tablename__ = "meeting_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    issue_discussed = Column(Text, nullable=False)
    person_responsible_staff_id = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True, index=True)
    target_date = Column(Date, nullable=True)
    invoice_date = Column(Date, nullable=True)
    payment_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="items")
    responsible_person = relationship("Staff", foreign_keys=[person_responsible_staff_id], back_populates="meeting_items")

    def __repr__(self):
        return f"<MeetingItem(id={self.id}, meeting_id={self.meeting_id})>"
