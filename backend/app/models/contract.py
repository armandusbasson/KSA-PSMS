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
    sections = relationship("ContractSection", back_populates="contract", cascade="all, delete-orphan", order_by="ContractSection.order")

    def __repr__(self):
        return f"<Contract(id={self.id}, type={self.contract_type}, site_id={self.site_id})>"


class ContractSection(Base):
    """Contract section for grouping line items (e.g., 'Section A - Preliminary and General')"""
    __tablename__ = "contract_sections"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)  # e.g., "Section A"
    description = Column(String(500), nullable=True)  # e.g., "Preliminary and General"
    order = Column(Integer, default=0)  # For ordering sections
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    contract = relationship("Contract", back_populates="sections")
    line_items = relationship("ContractLineItem", back_populates="section", cascade="all, delete-orphan", order_by="ContractLineItem.order")

    def __repr__(self):
        return f"<ContractSection(id={self.id}, name={self.name}, contract_id={self.contract_id})>"


class ContractLineItem(Base):
    """Individual line item within a contract section"""
    __tablename__ = "contract_line_items"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("contract_sections.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(500), nullable=False)  # e.g., "Site Establishment"
    value = Column(Numeric(15, 2), nullable=False, default=0)  # Value in ZAR
    order = Column(Integer, default=0)  # For ordering items within a section
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    section = relationship("ContractSection", back_populates="line_items")

    def __repr__(self):
        return f"<ContractLineItem(id={self.id}, description={self.description}, value={self.value})>"
