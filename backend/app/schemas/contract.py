from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional
from app.models.contract import ContractType, ContractStatus


class ContractBase(BaseModel):
    """Base contract schema with common fields"""
    contract_type: ContractType = Field(..., description="Type of contract: Supply or Service")
    start_date: datetime = Field(..., description="Contract start date")
    end_date: datetime = Field(..., description="Contract end date")
    status: ContractStatus = Field(default=ContractStatus.ACTIVE, description="Current contract status")
    site_id: int = Field(..., description="Associated site ID")
    responsible_staff_id: int = Field(..., description="Responsible staff member ID")
    eskom_reference: Optional[str] = Field(None, max_length=255, description="Eskom contract reference number")
    contact_person_name: Optional[str] = Field(None, max_length=255, description="Contact person name")
    contact_person_telephone: Optional[str] = Field(None, max_length=20, description="Contact person telephone")
    contact_person_email: Optional[EmailStr] = Field(None, description="Contact person email")
    contract_value: Optional[float] = Field(None, description="Contract value in ZAR (South African Rand)")
    notes: Optional[str] = Field(None, description="General notes about the contract")


class ContractCreate(ContractBase):
    """Schema for creating a new contract"""
    pass


class ContractUpdate(BaseModel):
    """Schema for updating a contract"""
    contract_type: Optional[ContractType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[ContractStatus] = None
    site_id: Optional[int] = None
    responsible_staff_id: Optional[int] = None
    eskom_reference: Optional[str] = Field(None, max_length=255)
    contact_person_name: Optional[str] = Field(None, max_length=255)
    contact_person_telephone: Optional[str] = Field(None, max_length=20)
    contact_person_email: Optional[EmailStr] = None
    contract_value: Optional[float] = None
    notes: Optional[str] = None


class ContractResponse(ContractBase):
    """Schema for contract response"""
    id: int
    document_filename: Optional[str] = None
    document_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContractDetail(ContractResponse):
    """Extended response with related site and staff information"""
    site_name: Optional[str] = None
    responsible_staff_name: Optional[str] = None
    responsible_staff_surname: Optional[str] = None

    class Config:
        from_attributes = True


class ContractSummary(BaseModel):
    """Summary statistics for contracts"""
    total_contracts: int = 0
    active_count: int = 0
    expired_count: int = 0
    completed_count: int = 0
    cancelled_count: int = 0
    overdue_count: int = 0  # Active contracts past end_date

    class Config:
        from_attributes = True
