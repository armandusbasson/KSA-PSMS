from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class StaffCreate(BaseModel):
    """Schema for creating a new staff member"""
    name: str = Field(..., min_length=1, max_length=255)
    surname: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)

class StaffUpdate(BaseModel):
    """Schema for updating a staff member"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    surname: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)

class StaffResponse(BaseModel):
    """Schema for staff response"""
    id: int
    name: str
    surname: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StaffDetailResponse(StaffResponse):
    """Extended staff response with relationships"""
    site_count: int = 0
