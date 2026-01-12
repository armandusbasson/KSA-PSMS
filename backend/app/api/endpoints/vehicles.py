from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db
from app.crud import vehicle as crud_vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, VehicleDetailResponse
from app.models.staff import Staff

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


@router.get("/type/{vehicle_type}", response_model=List[VehicleResponse])
def get_vehicles_by_type(vehicle_type: str, db: Session = Depends(get_db)):
    """Get all vehicles of a specific type"""
    vehicles = crud_vehicle.get_vehicles_by_type(db, vehicle_type)
    return vehicles
