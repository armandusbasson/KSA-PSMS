from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse, StaffDetailResponse
from app.crud import staff as crud_staff
from typing import List

router = APIRouter(prefix="/api/staff", tags=["staff"])

@router.post("", response_model=StaffResponse)
def create_staff(staff: StaffCreate, db: Session = Depends(get_db)):
    """Create a new staff member"""
    return crud_staff.create_staff(db, staff)

@router.get("", response_model=List[StaffResponse])
def list_staff(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all staff members"""
    return crud_staff.list_staff(db, skip, limit)

@router.get("/{staff_id}", response_model=StaffDetailResponse)
def get_staff(staff_id: int, db: Session = Depends(get_db)):
    """Get a specific staff member with details"""
    db_staff = crud_staff.get_staff(db, staff_id)
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Manually compute site count
    result = StaffDetailResponse(
        **{**db_staff.__dict__, "site_count": len(db_staff.site_links)}
    )
    return result

@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(staff_id: int, staff: StaffUpdate, db: Session = Depends(get_db)):
    """Update a staff member"""
    db_staff = crud_staff.update_staff(db, staff_id, staff)
    if not db_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return db_staff

@router.delete("/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    """Delete a staff member"""
    success = crud_staff.delete_staff(db, staff_id)
    if not success:
        raise HTTPException(status_code=404, detail="Staff not found")
    return {"message": "Staff deleted successfully"}
