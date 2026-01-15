from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models.contract import ContractType, ContractStatus


# Line Item Schemas
class ContractLineItemBase(BaseModel):
    """Base schema for contract line items"""
    description: str = Field(..., max_length=500, description="Line item description")
    value: float = Field(default=0, description="Line item value in ZAR")
    order: int = Field(default=0, description="Order of the item within the section")


class ContractLineItemCreate(ContractLineItemBase):
    """Schema for creating a new line item"""
    pass


class ContractLineItemUpdate(BaseModel):
    """Schema for updating a line item"""
    description: Optional[str] = Field(None, max_length=500)
    value: Optional[float] = None
    order: Optional[int] = None


class ContractLineItemResponse(ContractLineItemBase):
    """Schema for line item response"""
    id: int
    section_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Section Schemas
class ContractSectionBase(BaseModel):
    """Base schema for contract sections"""
    name: str = Field(..., max_length=255, description="Section name (e.g., 'Section A')")
    description: Optional[str] = Field(None, max_length=500, description="Section description (e.g., 'Preliminary and General')")
    order: int = Field(default=0, description="Order of the section")


class ContractSectionCreate(ContractSectionBase):
    """Schema for creating a new section"""
    line_items: List[ContractLineItemCreate] = Field(default=[], description="Line items in this section")


class ContractSectionUpdate(BaseModel):
    """Schema for updating a section"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = None


class ContractSectionResponse(ContractSectionBase):
    """Schema for section response"""
    id: int
    contract_id: int
    line_items: List[ContractLineItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


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
    sections: List[ContractSectionCreate] = Field(default=[], description="Contract sections with line items (for Service contracts)")


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
    sections: List[ContractSectionResponse] = []
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
