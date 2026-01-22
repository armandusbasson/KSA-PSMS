from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.config import settings
from app.database import init_db, get_db
from app.api.endpoints import sites, staff, meetings, contracts, vehicles, auth
from app.crud.user import create_default_admin

# Initialize database
init_db()

# Create default admin user if no users exist
db = next(get_db())
create_default_admin(db)
db.close()

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Power Station Management System API"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for file serving
uploads_path = Path("uploads")
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(sites.router)
app.include_router(staff.router)
app.include_router(meetings.router)
app.include_router(contracts.router)
app.include_router(vehicles.router)

@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Kulkoni SA Power Station Management API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
