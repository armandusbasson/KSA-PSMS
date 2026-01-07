from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse, SiteDetailResponse
from app.crud import site as crud_site
from app.crud import site_staff
from app.schemas.staff import StaffResponse
from typing import List

router = APIRouter(prefix="/api/sites", tags=["sites"])

@router.post("", response_model=SiteResponse)
def create_site(site: SiteCreate, db: Session = Depends(get_db)):
    """Create a new site"""
    # Check if site name already exists
    existing = crud_site.get_site_by_name(db, site.name)
    if existing:
        raise HTTPException(status_code=400, detail="Site name already exists")
    
    return crud_site.create_site(db, site)

@router.get("", response_model=List[SiteResponse])
def list_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all sites"""
    return crud_site.list_sites(db, skip, limit)

@router.get("/{site_id}", response_model=SiteDetailResponse)
def get_site(site_id: int, db: Session = Depends(get_db)):
    """Get a specific site with details"""
    db_site = crud_site.get_site(db, site_id)
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    # Manually compute counts to include in response
    result = SiteDetailResponse(
        **{**db_site.__dict__, "staff_count": len(db_site.staff_links), "meeting_count": len(db_site.meetings)}
    )
    return result

@router.put("/{site_id}", response_model=SiteResponse)
def update_site(site_id: int, site: SiteUpdate, db: Session = Depends(get_db)):
    """Update a site"""
    db_site = crud_site.update_site(db, site_id, site)
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    return db_site

@router.delete("/{site_id}")
def delete_site(site_id: int, db: Session = Depends(get_db)):
    """Delete a site"""
    success = crud_site.delete_site(db, site_id)
    if not success:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"message": "Site deleted successfully"}

# Site-Staff endpoints

@router.get("/{site_id}/staff", response_model=List[StaffResponse])
def get_site_staff(site_id: int, db: Session = Depends(get_db)):
    """Get all staff assigned to a site"""
    # Check if site exists
    db_site = crud_site.get_site(db, site_id)
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    return site_staff.get_site_staff(db, site_id)

@router.post("/{site_id}/staff/{staff_id}")
def add_staff_to_site(site_id: int, staff_id: int, db: Session = Depends(get_db)):
    """Add a staff member to a site"""
    link = site_staff.add_staff_to_site(db, site_id, staff_id)
    if not link:
        raise HTTPException(status_code=404, detail="Site or staff not found")
    return {"message": "Staff added to site successfully"}

@router.delete("/{site_id}/staff/{staff_id}")
def remove_staff_from_site(site_id: int, staff_id: int, db: Session = Depends(get_db)):
    """Remove a staff member from a site"""
    success = site_staff.remove_staff_from_site(db, site_id, staff_id)
    if not success:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Staff removed from site successfully"}
