from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse
from app.crud import meeting as crud_meeting
from typing import List, Optional

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

@router.post("", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """Create a new meeting with items"""
    db_meeting = crud_meeting.create_meeting(db, meeting)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Site not found")
    return db_meeting

@router.get("", response_model=List[MeetingResponse])
def list_meetings(skip: int = 0, limit: int = 100, site_id: Optional[int] = None, db: Session = Depends(get_db)):
    """List meetings (optionally filtered by site)"""
    return crud_meeting.list_meetings(db, skip, limit, site_id)

@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """Get a specific meeting"""
    db_meeting = crud_meeting.get_meeting(db, meeting_id)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, meeting: MeetingUpdate, db: Session = Depends(get_db)):
    """Update a meeting and its items"""
    db_meeting = crud_meeting.update_meeting(db, meeting_id, meeting)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """Delete a meeting"""
    success = crud_meeting.delete_meeting(db, meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Meeting deleted successfully"}

# Site-specific meeting endpoint

@router.get("/site/{site_id}", response_model=List[MeetingResponse])
def get_site_meetings(site_id: int, db: Session = Depends(get_db)):
    """Get all meetings for a specific site"""
    return crud_meeting.get_site_meetings(db, site_id)
