from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class StaffBasic(BaseModel):
    """Basic staff info for meeting items"""
    id: int
    name: str
    surname: str

    class Config:
        from_attributes = True

class MeetingItemCreate(BaseModel):
    """Schema for creating a meeting item"""
    issue_discussed: str = Field(..., min_length=1)
    responsible_staff_ids: List[int] = []
    target_date: Optional[date] = None
    invoice_date: Optional[date] = None
    payment_date: Optional[date] = None

class MeetingItemUpdate(BaseModel):
    """Schema for updating a meeting item"""
    issue_discussed: Optional[str] = Field(None, min_length=1)
    responsible_staff_ids: Optional[List[int]] = None
    target_date: Optional[date] = None
    invoice_date: Optional[date] = None
    payment_date: Optional[date] = None

class MeetingItemResponse(BaseModel):
    """Schema for meeting item response"""
    id: int
    meeting_id: int
    issue_discussed: str
    responsible_staff: List[StaffBasic] = []
    target_date: Optional[date] = None
    invoice_date: Optional[date] = None
    payment_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    """Schema for creating a new meeting"""
    site_id: int
    agenda: Optional[str] = None
    attendees: Optional[str] = None
    apologies: Optional[str] = None
    chairperson_staff_id: Optional[int] = None
    introduction: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    items: List[MeetingItemCreate] = []

class MeetingUpdate(BaseModel):
    """Schema for updating a meeting"""
    agenda: Optional[str] = None
    attendees: Optional[str] = None
    apologies: Optional[str] = None
    chairperson_staff_id: Optional[int] = None
    introduction: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    items: Optional[List[MeetingItemCreate]] = None


class MeetingResponse(BaseModel):
    """Schema for meeting response"""
    id: int
    site_id: int
    agenda: Optional[str] = None
    attendees: Optional[str] = None
    apologies: Optional[str] = None
    chairperson_staff_id: Optional[int] = None
    introduction: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[MeetingItemResponse] = []

    class Config:
        from_attributes = True
