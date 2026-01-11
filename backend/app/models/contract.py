from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Numeric
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ContractType(str, enum.Enum):
    """Contract type enumeration"""
    SUPPLY = "Supply"
    SERVICE = "Service"


class ContractStatus(str, enum.Enum):
    """Contract status enumeration"""
    ACTIVE = "Active"
    EXPIRED = "Expired"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class Contract(Base):
    """Contract model for power station service/supply agreements"""
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic information
    contract_type = Column(SQLEnum(ContractType), nullable=False)
    status = Column(SQLEnum(ContractStatus), default=ContractStatus.ACTIVE, nullable=False)
    
    # Dates
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Reference numbers
    eskom_reference = Column(String(255), nullable=True)  # Eskom Contract Reference Number
    
    # Contact information
    contact_person_name = Column(String(255), nullable=True)
    contact_person_telephone = Column(String(20), nullable=True)
    contact_person_email = Column(String(255), nullable=True)
    
    # Contract value
    contract_value = Column(Numeric(15, 2), nullable=True)  # Contract value in ZAR
    
    # Notes
    notes = Column(Text, nullable=True)  # General notes about the contract
    
    # File storage
    document_filename = Column(String(255), nullable=True)  # Original filename
    document_path = Column(String(500), nullable=True)  # Server path to uploaded file
    
    # Foreign keys
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False, index=True)
    responsible_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    site = relationship("Site", backref="contracts")
    responsible_staff = relationship("Staff", backref="contracts")

    def __repr__(self):
        return f"<Contract(id={self.id}, type={self.contract_type}, site_id={self.site_id})>"
