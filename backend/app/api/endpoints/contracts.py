import os
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.crud import contract as crud_contract
from app.schemas.contract import ContractCreate, ContractUpdate, ContractResponse, ContractDetail, ContractSummary
from app.models.contract import ContractStatus
from app.models import Staff

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/contracts")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("", response_model=list[ContractResponse])
def list_contracts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    site_id: int = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get all contracts with optional filtering"""
    # Update any expired contracts before returning
    crud_contract.update_expired_contracts(db)
    
    if site_id:
        contracts = crud_contract.get_contracts_by_site(db, site_id)
    elif status:
        try:
            status_enum = ContractStatus(status)
            contracts = crud_contract.get_contracts_by_status(db, status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    else:
        contracts = crud_contract.get_contracts(db, skip, limit)
    
    return contracts


@router.get("/summary", response_model=ContractSummary)
def get_contracts_summary(db: Session = Depends(get_db)):
    """Get contract statistics summary"""
    # Update any expired contracts before getting summary
    crud_contract.update_expired_contracts(db)
    summary = crud_contract.get_contract_summary(db)
    return summary


@router.get("/summary/by-type/{contract_type}", response_model=dict)
def get_contracts_summary_by_type(contract_type: str, db: Session = Depends(get_db)):
    """Get contract statistics summary filtered by type (Supply or Service)"""
    # Update any expired contracts before getting summary
    crud_contract.update_expired_contracts(db)
    if contract_type not in ["Supply", "Service"]:
        raise HTTPException(status_code=400, detail="Invalid contract type. Use 'Supply' or 'Service'")
    summary = crud_contract.get_contract_summary_by_type(db, contract_type)
    return summary


@router.get("/overdue", response_model=list[ContractResponse])
def get_overdue_contracts(db: Session = Depends(get_db)):
    """Get all overdue contracts (Active status past end_date)"""
    # Update any expired contracts first
    crud_contract.update_expired_contracts(db)
    contracts = crud_contract.get_overdue_contracts(db)
    return contracts


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    """Get a specific contract by ID"""
    # Update any expired contracts before returning
    crud_contract.update_expired_contracts(db)
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract


@router.post("", response_model=ContractResponse)
def create_contract(
    contract: ContractCreate,
    db: Session = Depends(get_db)
):
    """Create a new contract"""
    # Validate that site and staff exist
    site = db.query(Site).filter(Site.id == contract.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    staff = db.query(Staff).filter(Staff.id == contract.responsible_staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Validate date logic
    if contract.start_date >= contract.end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    db_contract = crud_contract.create_contract(db, contract)
    return db_contract


@router.put("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: int,
    contract_update: ContractUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing contract"""
    db_contract = crud_contract.get_contract(db, contract_id)
    if not db_contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Validate foreign keys if they're being updated
    if contract_update.site_id:
        site = db.query(Site).filter(Site.id == contract_update.site_id).first()
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
    
    if contract_update.responsible_staff_id:
        staff = db.query(Staff).filter(Staff.id == contract_update.responsible_staff_id).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Validate dates if they're being updated
    start_date = contract_update.start_date or db_contract.start_date
    end_date = contract_update.end_date or db_contract.end_date
    if start_date >= end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    updated_contract = crud_contract.update_contract(db, contract_id, contract_update)
    return updated_contract


@router.delete("/{contract_id}")
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    """Delete a contract"""
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Delete associated file if it exists
    if contract.document_path:
        try:
            if os.path.exists(contract.document_path):
                os.remove(contract.document_path)
        except OSError:
            pass  # Log but don't fail if file deletion fails
    
    crud_contract.delete_contract(db, contract_id)
    return {"message": "Contract deleted successfully"}


@router.post("/{contract_id}/upload")
def upload_contract_file(
    contract_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a contract document file"""
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
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
    
    # Create unique filename with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"contract_{contract_id}_{timestamp}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update contract record
    updated_contract = crud_contract.update_contract_file(
        db, contract_id, file.filename, str(file_path)
    )
    
    return {
        "message": "File uploaded successfully",
        "contract": updated_contract,
        "filename": unique_filename
    }


@router.get("/{contract_id}/download")
def download_contract_file(contract_id: int, db: Session = Depends(get_db)):
    """Download a contract document file"""
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if not contract.document_path:
        raise HTTPException(status_code=404, detail="Contract document not found")
    
    # Handle both relative and absolute paths
    file_path = Path(contract.document_path)
    if not file_path.is_absolute():
        file_path = Path.cwd() / file_path
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Contract document file not found on disk")
    
    # Return file for download
    return FileResponse(
        file_path,
        filename=contract.document_filename,
        media_type="application/octet-stream"
    )


@router.delete("/{contract_id}/file")
def delete_contract_file(contract_id: int, db: Session = Depends(get_db)):
    """Delete a contract document file"""
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if not contract.document_path:
        raise HTTPException(status_code=404, detail="No document attached to this contract")
    
    # Delete file from disk
    file_path = Path(contract.document_path)
    if not file_path.is_absolute():
        file_path = Path.cwd() / file_path
    
    try:
        if file_path.exists():
            file_path.unlink()
    except OSError:
        pass  # Log but don't fail if file deletion fails
    
    # Update contract to remove file metadata
    crud_contract.update_contract_file(db, contract_id, None, None)
    
    return {"message": "Document deleted successfully"}


# Import Site model
from app.models.site import Site

# Import section and line item schemas
from app.schemas.contract import (
    ContractSectionCreate, ContractSectionUpdate, ContractSectionResponse,
    ContractLineItemCreate, ContractLineItemUpdate, ContractLineItemResponse
)


# Contract Sections endpoints
@router.get("/{contract_id}/sections", response_model=list[ContractSectionResponse])
def list_contract_sections(contract_id: int, db: Session = Depends(get_db)):
    """Get all sections for a contract"""
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return crud_contract.get_sections_by_contract(db, contract_id)


@router.post("/{contract_id}/sections", response_model=ContractSectionResponse)
def create_contract_section(
    contract_id: int,
    section: ContractSectionCreate,
    db: Session = Depends(get_db)
):
    """Create a new section for a contract"""
    contract = crud_contract.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    return crud_contract.create_section(db, contract_id, section)


@router.put("/sections/{section_id}", response_model=ContractSectionResponse)
def update_contract_section(
    section_id: int,
    section_update: ContractSectionUpdate,
    db: Session = Depends(get_db)
):
    """Update a contract section"""
    updated = crud_contract.update_section(db, section_id, section_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Section not found")
    return updated


@router.delete("/sections/{section_id}")
def delete_contract_section(section_id: int, db: Session = Depends(get_db)):
    """Delete a contract section"""
    if not crud_contract.delete_section(db, section_id):
        raise HTTPException(status_code=404, detail="Section not found")
    return {"message": "Section deleted successfully"}


# Contract Line Items endpoints
@router.get("/sections/{section_id}/items", response_model=list[ContractLineItemResponse])
def list_section_items(section_id: int, db: Session = Depends(get_db)):
    """Get all line items for a section"""
    section = crud_contract.get_section(db, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return crud_contract.get_line_items_by_section(db, section_id)


@router.post("/sections/{section_id}/items", response_model=ContractLineItemResponse)
def create_section_item(
    section_id: int,
    item: ContractLineItemCreate,
    db: Session = Depends(get_db)
):
    """Create a new line item for a section"""
    section = crud_contract.get_section(db, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    return crud_contract.create_line_item(db, section_id, item)


@router.put("/items/{item_id}", response_model=ContractLineItemResponse)
def update_line_item(
    item_id: int,
    item_update: ContractLineItemUpdate,
    db: Session = Depends(get_db)
):
    """Update a line item"""
    updated = crud_contract.update_line_item(db, item_id, item_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Line item not found")
    return updated


@router.delete("/items/{item_id}")
def delete_line_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a line item"""
    if not crud_contract.delete_line_item(db, item_id):
        raise HTTPException(status_code=404, detail="Line item not found")
    return {"message": "Line item deleted successfully"}
