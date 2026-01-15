from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.models.vehicle import VehicleType, PrimaryUse


class VehicleBase(BaseModel):
    """Base vehicle schema with common fields"""
    vehicle_registration_plate: str = Field(..., max_length=255, description="Vehicle registration/license plate")
    make: str = Field(..., max_length=100, description="Vehicle make/manufacturer")
    model: str = Field(..., max_length=100, description="Vehicle model")
    engine_displacement: Optional[str] = Field(None, max_length=100, description="Engine displacement")
    description: Optional[str] = Field(None, max_length=500, description="Vehicle description")
    year: int = Field(..., description="Year of manufacture")
    vin_chassis_number: Optional[str] = Field(None, max_length=255, description="VIN or chassis number")
    vehicle_type: str = Field(..., description="Type of vehicle: Sedan, SUV, Truck, Van")
    colour: Optional[str] = Field(None, max_length=100, description="Vehicle colour")
    purchase_date: Optional[date] = Field(None, description="Date vehicle was purchased")
    active_tracking: bool = Field(default=True, description="Whether active tracking is enabled")
    assigned_staff_id: Optional[int] = Field(None, description="ID of assigned staff member")
    primary_use: str = Field(..., description="Primary use: Delivery, Sales, Executive, Pool Vehicle, Service")
    license_renewal_date: Optional[date] = Field(None, description="License renewal date")
    general_notes: Optional[str] = Field(None, max_length=1000, description="General notes about vehicle")
    natis_document: Optional[str] = Field(None, max_length=500, description="Path to NATIS document")


class VehicleCreate(VehicleBase):
    """Schema for creating a new vehicle"""
    pass


class VehicleUpdate(BaseModel):
    """Schema for updating a vehicle"""
    make: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    engine_displacement: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    year: Optional[int] = None
    vin_chassis_number: Optional[str] = Field(None, max_length=255)
    vehicle_type: Optional[str] = None
    colour: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[date] = None
    active_tracking: Optional[bool] = None
    assigned_staff_id: Optional[int] = None
    primary_use: Optional[str] = None
    license_renewal_date: Optional[date] = None
    general_notes: Optional[str] = Field(None, max_length=1000)
    natis_document: Optional[str] = Field(None, max_length=500)


class VehicleResponse(VehicleBase):
    """Schema for vehicle response"""
    vehicle_registration_plate: str
    created_at: datetime
    updated_at: datetime


class VehicleDetailResponse(VehicleResponse):
    """Detailed vehicle response with staff information"""
    assigned_staff_name: Optional[str] = None
    assigned_staff_surname: Optional[str] = None
