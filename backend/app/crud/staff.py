from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.staff import Staff
from app.models.site import SiteStaffLink
from app.schemas.staff import StaffCreate, StaffUpdate
from typing import List, Optional

def create_staff(db: Session, staff: StaffCreate) -> Staff:
    """Create a new staff member"""
    db_staff = Staff(**staff.model_dump())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def get_staff(db: Session, staff_id: int) -> Optional[Staff]:
    """Get a staff member by ID"""
    return db.query(Staff).filter(Staff.id == staff_id).first()

def list_staff(db: Session, skip: int = 0, limit: int = 100) -> List[Staff]:
    """List all staff members with pagination"""
    return db.query(Staff).offset(skip).limit(limit).all()

def update_staff(db: Session, staff_id: int, staff: StaffUpdate) -> Optional[Staff]:
    """Update a staff member"""
    db_staff = get_staff(db, staff_id)
    if not db_staff:
        return None
    
    update_data = staff.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_staff, key, value)
    
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def delete_staff(db: Session, staff_id: int) -> bool:
    """Delete a staff member"""
    db_staff = get_staff(db, staff_id)
    if not db_staff:
        return False
    
    db.delete(db_staff)
    db.commit()
    return True

def get_staff_site_count(db: Session, staff_id: int) -> int:
    """Get number of sites assigned to a staff member"""
    return db.query(func.count(SiteStaffLink.id)).filter(
        SiteStaffLink.staff_id == staff_id
    ).scalar() or 0
