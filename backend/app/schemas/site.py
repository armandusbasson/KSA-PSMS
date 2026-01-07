from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SiteCreate(BaseModel):
    """Schema for creating a new site"""
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    contact_number: Optional[str] = Field(None, max_length=20)
    contact_email: Optional[str] = Field(None, max_length=255)
    coordinates: Optional[str] = None

class SiteUpdate(BaseModel):
    """Schema for updating a site"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    contact_number: Optional[str] = Field(None, max_length=20)
    contact_email: Optional[str] = Field(None, max_length=255)
    coordinates: Optional[str] = None

class SiteResponse(BaseModel):
    """Schema for site response"""
    id: int
    name: str
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    contact_email: Optional[str] = None
    coordinates: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SiteDetailResponse(SiteResponse):
    """Extended site response with relationships"""
    staff_count: int = 0
    meeting_count: int = 0
