from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from app.models.contract import Contract, ContractStatus
from app.schemas.contract import ContractCreate, ContractUpdate


def get_contract(db: Session, contract_id: int) -> Contract | None:
    """Get a contract by ID"""
    return db.query(Contract).filter(Contract.id == contract_id).first()


def get_contracts(db: Session, skip: int = 0, limit: int = 100) -> list[Contract]:
    """Get all contracts with pagination"""
    return db.query(Contract).offset(skip).limit(limit).all()


def get_contracts_by_site(db: Session, site_id: int) -> list[Contract]:
    """Get all contracts for a specific site"""
    return db.query(Contract).filter(Contract.site_id == site_id).all()


def get_contracts_by_staff(db: Session, staff_id: int) -> list[Contract]:
    """Get all contracts assigned to a specific staff member"""
    return db.query(Contract).filter(Contract.responsible_staff_id == staff_id).all()


def get_contracts_by_status(db: Session, status: ContractStatus) -> list[Contract]:
    """Get all contracts with a specific status"""
    return db.query(Contract).filter(Contract.status == status).all()


def get_overdue_contracts(db: Session) -> list[Contract]:
    """Get active contracts that are past their end date"""
    now = datetime.utcnow()
    return db.query(Contract).filter(
        and_(
            Contract.status == ContractStatus.ACTIVE,
            Contract.end_date < now
        )
    ).all()


def update_expired_contracts(db: Session) -> int:
    """Update any active contracts that are past their end date to expired status"""
    now = datetime.utcnow()
    
    # Get all active contracts that are past their end date
    expired_contracts = db.query(Contract).filter(
        and_(
            Contract.status == ContractStatus.ACTIVE,
            Contract.end_date < now
        )
    ).all()
    
    count = 0
    for contract in expired_contracts:
        contract.status = ContractStatus.EXPIRED
        contract.updated_at = now
        db.add(contract)
        count += 1
    
    if count > 0:
        db.commit()
        # Refresh all contracts to ensure database is synchronized
        for contract in expired_contracts:
            db.refresh(contract)
    
    return count


def create_contract(db: Session, contract: ContractCreate) -> Contract:
    """Create a new contract"""
    db_contract = Contract(
        contract_type=contract.contract_type,
        start_date=contract.start_date,
        end_date=contract.end_date,
        status=contract.status,
        site_id=contract.site_id,
        responsible_staff_id=contract.responsible_staff_id,
        eskom_reference=contract.eskom_reference,
        contact_person_name=contract.contact_person_name,
        contact_person_telephone=contract.contact_person_telephone,
        contact_person_email=contract.contact_person_email,
        internal_quotation_number=contract.internal_quotation_number,
        internal_invoice_number=contract.internal_invoice_number,
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract


def update_contract(db: Session, contract_id: int, contract_update: ContractUpdate) -> Contract | None:
    """Update a contract"""
    db_contract = get_contract(db, contract_id)
    if not db_contract:
        return None
    
    update_data = contract_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_contract, field):
            setattr(db_contract, field, value)
    
    db_contract.updated_at = datetime.utcnow()
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract


def update_contract_file(db: Session, contract_id: int, filename: str | None, filepath: str | None) -> Contract | None:
    """Update contract file information"""
    db_contract = get_contract(db, contract_id)
    if not db_contract:
        return None
    
    db_contract.document_filename = filename
    db_contract.document_path = filepath
    db_contract.updated_at = datetime.utcnow()
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract


def delete_contract(db: Session, contract_id: int) -> bool:
    """Delete a contract"""
    db_contract = get_contract(db, contract_id)
    if not db_contract:
        return False
    
    db.delete(db_contract)
    db.commit()
    return True


def get_contract_summary(db: Session) -> dict:
    """Get summary statistics for all contracts"""
    now = datetime.utcnow()
    
    total = db.query(Contract).count()
    active = db.query(Contract).filter(Contract.status == ContractStatus.ACTIVE).count()
    expired = db.query(Contract).filter(Contract.status == ContractStatus.EXPIRED).count()
    completed = db.query(Contract).filter(Contract.status == ContractStatus.COMPLETED).count()
    cancelled = db.query(Contract).filter(Contract.status == ContractStatus.CANCELLED).count()
    overdue = db.query(Contract).filter(
        and_(
            Contract.status == ContractStatus.ACTIVE,
            Contract.end_date < now
        )
    ).count()
    
    return {
        "total_contracts": total,
        "active_count": active,
        "expired_count": expired,
        "completed_count": completed,
        "cancelled_count": cancelled,
        "overdue_count": overdue,
    }
