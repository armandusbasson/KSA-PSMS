from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class VehicleType(str, enum.Enum):
    SEDAN = "Sedan"
    SUV = "SUV"
    TRUCK = "Truck"
    VAN = "Van"


class PrimaryUse(str, enum.Enum):
    DELIVERY = "Delivery"
    SALES = "Sales"
    EXECUTIVE = "Executive"
    POOL_VEHICLE = "Pool Vehicle"
    SERVICE = "Service"


class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_registration_plate = Column(String(255), primary_key=True, unique=True, nullable=False)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    vin_chassis_number = Column(String(255), nullable=True)
    vehicle_type = Column(String(50), nullable=False)  # Sedan, SUV, Truck, Van
    colour = Column(String(100), nullable=True)
    purchase_date = Column(Date, nullable=True)
    active_tracking = Column(Boolean, default=True, nullable=False)
    assigned_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    primary_use = Column(String(50), nullable=False)  # Delivery, Sales, Executive, Pool Vehicle, Service
    license_renewal_date = Column(Date, nullable=True)
    general_notes = Column(String(1000), nullable=True)
    natis_document = Column(String(500), nullable=True)  # File path or URL
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to Staff
    assigned_staff = relationship("Staff", foreign_keys=[assigned_staff_id])

    class Config:
        from_attributes = True
