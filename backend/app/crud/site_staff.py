from sqlalchemy.orm import Session
from app.models.site import Site, SiteStaffLink, StaffRole
from app.models.staff import Staff
from typing import List, Optional

def add_staff_to_site(db: Session, site_id: int, staff_id: int, role: str) -> Optional[SiteStaffLink]:
    """Add a staff member to a site with a specific role"""
    # Check if site and staff exist
    site = db.query(Site).filter(Site.id == site_id).first()
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    
    if not site or not staff:
        return None
    
    # Check if link already exists for this role
    existing_link = db.query(SiteStaffLink).filter(
        SiteStaffLink.site_id == site_id,
        SiteStaffLink.staff_id == staff_id,
        SiteStaffLink.role == role
    ).first()
    
    if existing_link:
        return existing_link
    
    # Create new link
    link = SiteStaffLink(site_id=site_id, staff_id=staff_id, role=role)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link

def remove_staff_from_site(db: Session, site_id: int, staff_id: int, role: str) -> bool:
    """Remove a staff member from a site in a specific role"""
    link = db.query(SiteStaffLink).filter(
        SiteStaffLink.site_id == site_id,
        SiteStaffLink.staff_id == staff_id,
        SiteStaffLink.role == role
    ).first()
    
    if not link:
        return False
    
    db.delete(link)
    db.commit()
    return True

def get_site_staff(db: Session, site_id: int) -> List[Staff]:
    """Get all staff members assigned to a site"""
    return db.query(Staff).join(
        SiteStaffLink
    ).filter(
        SiteStaffLink.site_id == site_id
    ).all()

def get_staff_sites(db: Session, staff_id: int) -> List[Site]:
    """Get all sites assigned to a staff member"""
    return db.query(Site).join(
        SiteStaffLink
    ).filter(
        SiteStaffLink.staff_id == staff_id
    ).all()
