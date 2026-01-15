from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.meeting import Meeting, MeetingItem
from app.models.site import Site
from app.models.staff import Staff
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingItemCreate
from typing import List, Optional

def create_meeting(db: Session, meeting: MeetingCreate) -> Optional[Meeting]:
    """Create a new meeting with items"""
    # Check if site exists
    site = db.query(Site).filter(Site.id == meeting.site_id).first()
    if not site:
        return None
    
    # Create meeting
    db_meeting = Meeting(
        site_id=meeting.site_id,
        agenda=meeting.agenda,
        attendees=meeting.attendees,
        apologies=meeting.apologies,
        chairperson_staff_id=meeting.chairperson_staff_id,
        introduction=meeting.introduction,
        scheduled_at=meeting.scheduled_at,
    )
    db.add(db_meeting)
    db.flush()
    
    # Add items
    for item in meeting.items:
        db_item = MeetingItem(
            meeting_id=db_meeting.id,
            issue_discussed=item.issue_discussed,
            target_date=item.target_date,
            invoice_date=item.invoice_date,
            payment_date=item.payment_date,
        )
        # Add responsible staff
        if item.responsible_staff_ids:
            responsible_staff = db.query(Staff).filter(Staff.id.in_(item.responsible_staff_ids)).all()
            db_item.responsible_staff = responsible_staff
        db.add(db_item)
    
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

def get_meeting(db: Session, meeting_id: int) -> Optional[Meeting]:
    """Get a meeting by ID"""
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def list_meetings(db: Session, skip: int = 0, limit: int = 100, site_id: Optional[int] = None) -> List[Meeting]:
    """List meetings with optional site filter"""
    query = db.query(Meeting)
    if site_id:
        query = query.filter(Meeting.site_id == site_id)
    return query.offset(skip).limit(limit).all()

def update_meeting(db: Session, meeting_id: int, meeting: MeetingUpdate) -> Optional[Meeting]:
    """Update a meeting and its items"""
    db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not db_meeting:
        return None
    
    # Update meeting fields
    if meeting.agenda is not None:
        db_meeting.agenda = meeting.agenda
    if meeting.attendees is not None:
        db_meeting.attendees = meeting.attendees
    if meeting.apologies is not None:
        db_meeting.apologies = meeting.apologies
    if meeting.chairperson_staff_id is not None:
        db_meeting.chairperson_staff_id = meeting.chairperson_staff_id
    if meeting.introduction is not None:
        db_meeting.introduction = meeting.introduction
    if meeting.scheduled_at is not None:
        db_meeting.scheduled_at = meeting.scheduled_at
    
    db.add(db_meeting)
    db.commit()
    
    # Update items if provided - do this in a separate transaction
    if meeting.items is not None:
        # Delete existing items (this cascades to junction table entries)
        db.query(MeetingItem).filter(MeetingItem.meeting_id == meeting_id).delete(synchronize_session=False)
        db.commit()
        
        # Add new items
        for item in meeting.items:
            db_item = MeetingItem(
                meeting_id=meeting_id,
                issue_discussed=item.issue_discussed,
                target_date=item.target_date,
                invoice_date=item.invoice_date,
                payment_date=item.payment_date,
            )
            db.add(db_item)
        
        db.commit()
        
        # Now add responsible staff relationships
        for idx, item in enumerate(meeting.items):
            if item.responsible_staff_ids:
                # Get the newly created item
                db_item = db.query(MeetingItem).filter(
                    MeetingItem.meeting_id == meeting_id
                ).order_by(MeetingItem.id).all()[idx]
                
                # Get staff members
                responsible_staff = db.query(Staff).filter(Staff.id.in_(item.responsible_staff_ids)).all()
                db_item.responsible_staff = responsible_staff
                db.add(db_item)
        
        db.commit()
    
    db.refresh(db_meeting)
    return db_meeting

def delete_meeting(db: Session, meeting_id: int) -> bool:
    """Delete a meeting (cascades to items)"""
    db_meeting = get_meeting(db, meeting_id)
    if not db_meeting:
        return False
    
    db.delete(db_meeting)
    db.commit()
    return True

def get_site_meetings(db: Session, site_id: int) -> List[Meeting]:
    """Get all meetings for a site"""
    return db.query(Meeting).filter(Meeting.site_id == site_id).all()
