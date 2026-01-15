from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class StaffRole(str, Enum):
    """Staff role enumeration for site assignments"""
    SITE_MANAGER = "Site Manager"
    SUPERVISOR = "Supervisor"
    VALVE_TECHNICIAN = "Valve Technician"
    CASUAL_STAFF = "Casual Staff"


class SiteStaffResponse(BaseModel):
    """Schema for staff assigned to a site"""
    staff_id: int
    staff_name: str
    staff_surname: Optional[str]
    staff_role: Optional[str]
    site_role: StaffRole

    class Config:
        from_attributes = True

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
    site_managers: List[SiteStaffResponse] = Field(default_factory=list)
    supervisors: List[SiteStaffResponse] = Field(default_factory=list)
    valve_technicians: List[SiteStaffResponse] = Field(default_factory=list)
    casual_staff: List[SiteStaffResponse] = Field(default_factory=list)
