from sqlalchemy.orm import Session
from datetime import datetime
from app.models.vehicle import Vehicle
from app.models.staff import Staff
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def get_vehicle(db: Session, registration_plate: str) -> Vehicle | None:
    """Get a vehicle by registration plate"""
    return db.query(Vehicle).filter(Vehicle.vehicle_registration_plate == registration_plate).first()


def get_vehicles(db: Session, skip: int = 0, limit: int = 100) -> list[Vehicle]:
    """Get all vehicles with pagination"""
    return db.query(Vehicle).offset(skip).limit(limit).all()


def get_vehicles_by_staff(db: Session, staff_id: int) -> list[Vehicle]:
    """Get all vehicles assigned to a specific staff member"""
    return db.query(Vehicle).filter(Vehicle.assigned_staff_id == staff_id).all()


def get_active_vehicles(db: Session) -> list[Vehicle]:
    """Get all vehicles with active tracking enabled"""
    return db.query(Vehicle).filter(Vehicle.active_tracking == True).all()


def get_vehicles_by_type(db: Session, vehicle_type: str) -> list[Vehicle]:
    """Get all vehicles of a specific type"""
    return db.query(Vehicle).filter(Vehicle.vehicle_type == vehicle_type).all()


def get_vehicles_by_primary_use(db: Session, primary_use: str) -> list[Vehicle]:
    """Get all vehicles with a specific primary use"""
    return db.query(Vehicle).filter(Vehicle.primary_use == primary_use).all()


def create_vehicle(db: Session, vehicle: VehicleCreate) -> Vehicle:
    """Create a new vehicle"""
    db_vehicle = Vehicle(
        vehicle_registration_plate=vehicle.vehicle_registration_plate,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        vin_chassis_number=vehicle.vin_chassis_number,
        vehicle_type=vehicle.vehicle_type,
        colour=vehicle.colour,
        purchase_date=vehicle.purchase_date,
        active_tracking=vehicle.active_tracking,
        assigned_staff_id=vehicle.assigned_staff_id,
        primary_use=vehicle.primary_use,
        license_renewal_date=vehicle.license_renewal_date,
        general_notes=vehicle.general_notes,
        natis_document=vehicle.natis_document,
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


def update_vehicle(db: Session, registration_plate: str, vehicle_update: VehicleUpdate) -> Vehicle | None:
    """Update a vehicle"""
    db_vehicle = get_vehicle(db, registration_plate)
    if not db_vehicle:
        return None
    
    update_data = vehicle_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_vehicle, field):
            setattr(db_vehicle, field, value)
    
    db_vehicle.updated_at = datetime.utcnow()
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


def delete_vehicle(db: Session, registration_plate: str) -> bool:
    """Delete a vehicle"""
    db_vehicle = get_vehicle(db, registration_plate)
    if not db_vehicle:
        return False
    
    db.delete(db_vehicle)
    db.commit()
    return True
