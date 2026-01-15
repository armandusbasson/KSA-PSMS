from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.site import Site, SiteStaffLink
from app.schemas.site import SiteCreate, SiteUpdate
from typing import List, Optional

def create_site(db: Session, site: SiteCreate) -> Site:
    """Create a new site"""
    db_site = Site(**site.model_dump())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

def get_site(db: Session, site_id: int) -> Optional[Site]:
    """Get a site by ID"""
    return db.query(Site).filter(Site.id == site_id).first()

def get_site_by_name(db: Session, name: str) -> Optional[Site]:
    """Get a site by name"""
    return db.query(Site).filter(Site.name == name).first()

def list_sites(db: Session, skip: int = 0, limit: int = 100) -> List[Site]:
    """List all sites with pagination"""
    return db.query(Site).offset(skip).limit(limit).all()

def update_site(db: Session, site_id: int, site: SiteUpdate) -> Optional[Site]:
    """Update a site"""
    db_site = get_site(db, site_id)
    if not db_site:
        return None
    
    update_data = site.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_site, key, value)
    
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

def delete_site(db: Session, site_id: int) -> bool:
    """Delete a site"""
    db_site = get_site(db, site_id)
    if not db_site:
        return False
    
    db.delete(db_site)
    db.commit()
    return True

def get_site_staff_count(db: Session, site_id: int) -> int:
    """Get number of staff assigned to a site"""
    return db.query(func.count(SiteStaffLink.id)).filter(
        SiteStaffLink.site_id == site_id
    ).scalar() or 0

def get_site_meetings_count(db: Session, site_id: int) -> int:
    """Get number of meetings for a site"""
    from app.models.meeting import Meeting
    return db.query(func.count(Meeting.id)).filter(
        Meeting.site_id == site_id
    ).scalar() or 0
