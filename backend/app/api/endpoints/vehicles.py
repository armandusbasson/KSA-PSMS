from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
from datetime import datetime
from app.api.dependencies import get_db
from app.crud import vehicle as crud_vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, VehicleDetailResponse
from app.models.staff import Staff

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/vehicles")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("", response_model=List[VehicleResponse])
def get_vehicles(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000), db: Session = Depends(get_db)):
    """Get all vehicles with pagination"""
    vehicles = crud_vehicle.get_vehicles(db, skip=skip, limit=limit)
    return vehicles


@router.get("/{registration_plate}", response_model=VehicleDetailResponse)
def get_vehicle(registration_plate: str, db: Session = Depends(get_db)):
    """Get a vehicle by registration plate"""
    vehicle = crud_vehicle.get_vehicle(db, registration_plate)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    # Add staff information if assigned
    staff_info = {
        "assigned_staff_name": None,
        "assigned_staff_surname": None
    }
    if vehicle.assigned_staff_id:
        staff = db.query(Staff).filter(Staff.id == vehicle.assigned_staff_id).first()
        if staff:
            staff_info["assigned_staff_name"] = staff.name
            staff_info["assigned_staff_surname"] = staff.surname
    
    response = VehicleDetailResponse(
        **{**vehicle.__dict__, **staff_info}
    )
    return response


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Create a new vehicle"""
    # Check if vehicle with same registration plate already exists
    existing = crud_vehicle.get_vehicle(db, vehicle.vehicle_registration_plate)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle with this registration plate already exists"
        )
    
    db_vehicle = crud_vehicle.create_vehicle(db, vehicle)
    return db_vehicle


@router.put("/{registration_plate}", response_model=VehicleResponse)
def update_vehicle(registration_plate: str, vehicle_update: VehicleUpdate, db: Session = Depends(get_db)):
    """Update a vehicle"""
    db_vehicle = crud_vehicle.update_vehicle(db, registration_plate, vehicle_update)
    if not db_vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    return db_vehicle


@router.delete("/{registration_plate}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(registration_plate: str, db: Session = Depends(get_db)):
    """Delete a vehicle"""
    success = crud_vehicle.delete_vehicle(db, registration_plate)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    
    return None


@router.get("/staff/{staff_id}", response_model=List[VehicleResponse])
def get_vehicles_by_staff(staff_id: int, db: Session = Depends(get_db)):
    """Get all vehicles assigned to a specific staff member"""
    vehicles = crud_vehicle.get_vehicles_by_staff(db, staff_id)
    return vehicles


@router.post("/{registration_plate}/upload")
def upload_vehicle_file(
    registration_plate: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a NATIS document file for a vehicle"""
    try:
        print(f"DEBUG: Upload request for registration plate: {registration_plate}")
        print(f"DEBUG: File name: {file.filename}, content type: {file.content_type}")
        
        vehicle = crud_vehicle.get_vehicle(db, registration_plate)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Validate file type
        allowed_extensions = {'.pdf', '.docx', '.doc', '.xlsx', '.xls', '.txt', '.png', '.jpg', '.jpeg'}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed")
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024
        contents = file.file.read()
        if len(contents) > max_size:
            raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
        
        # Preserve original filename with safe name prefix
        # Use registration plate + original filename for uniqueness
        safe_plate = registration_plate.replace(" ", "_")
        safe_filename = Path(file.filename).stem  # filename without extension
        unique_filename = f"{safe_plate}_{safe_filename}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        print(f"DEBUG: Saving file to {file_path}")
        
        # Save file
        try:
            with open(file_path, "wb") as f:
                f.write(contents)
            print(f"DEBUG: File saved successfully")
        except IOError as e:
            print(f"DEBUG: IOError saving file: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        # Update vehicle record with file path
        try:
            print(f"DEBUG: Updating vehicle record")
            vehicle.natis_document = str(file_path)
            db.commit()
            db.refresh(vehicle)
            print(f"DEBUG: Vehicle record updated successfully")
        except Exception as e:
            print(f"DEBUG: Exception updating vehicle: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to update vehicle record: {str(e)}")
        
        return {
            "message": "File uploaded successfully",
            "file_path": str(file_path),
            "filename": file.filename,
            "original_filename": file.filename
        }
    except Exception as e:
        print(f"DEBUG: Unexpected error in upload: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/{registration_plate}/delete-upload")
def delete_vehicle_file(registration_plate: str, db: Session = Depends(get_db)):
    """Delete a NATIS document file for a vehicle"""
    vehicle = crud_vehicle.get_vehicle(db, registration_plate)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if not vehicle.natis_document:
        raise HTTPException(status_code=400, detail="No document to delete")
    
    # Delete file from filesystem
    try:
        file_path = Path(vehicle.natis_document)
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
    
    # Clear document path from vehicle record
    try:
        vehicle.natis_document = None
        db.commit()
        db.refresh(vehicle)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update vehicle record: {str(e)}")
    
    return {
        "message": "File deleted successfully",
        "vehicle": vehicle
    }

@router.get("/{registration_plate}/download")
def download_vehicle_file(registration_plate: str, db: Session = Depends(get_db)):
    """Download a NATIS document file for a vehicle"""
    try:
        vehicle = crud_vehicle.get_vehicle(db, registration_plate)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        if not vehicle.natis_document:
            raise HTTPException(status_code=404, detail="No document uploaded for this vehicle")
        
        file_path = Path(vehicle.natis_document)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get original filename from the stored path
        filename = file_path.name
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/octet-stream'
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

@router.get("/type/{vehicle_type}", response_model=List[VehicleResponse])
def get_vehicles_by_type(vehicle_type: str, db: Session = Depends(get_db)):
    """Get all vehicles of a specific type"""
    vehicles = crud_vehicle.get_vehicles_by_type(db, vehicle_type)
    return vehicles
