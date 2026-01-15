# Kulkoni SA Power Station Management System - Quick Start Guide

## Prerequisites

- Docker & Docker Compose installed
- Or for local development:
  - Python 3.11+
  - Node.js 18+

## Quick Start with Docker

### 1. Build and Run Services

```bash
cd /path/to/ksa-custom-erp-2
docker-compose up --build
```

This will:
- Build the backend FastAPI container
- Build the frontend React/Vite container
- Create a persistent SQLite database volume
- Start both services and connect them

### 2. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### 3. Stop Services

```bash
docker-compose down
```

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Local Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Backend will be available at: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## Database

- **Location:** SQLite file stored in `backend/app.db` (local) or Docker volume `db_volume` (containerized)
- **Auto-initialization:** Database tables are created automatically on first run
- **Persistence:** In Docker, the database persists across container restarts due to volume mounting

### Reset Database (Local Development)

```bash
# Stop the backend
# Delete app.db file
rm backend/app.db
# Restart the backend
```

### Reset Database (Docker)

```bash
docker-compose down -v  # -v flag removes volumes
docker-compose up --build
```

---

## API Endpoints Summary

### Sites Management
```
GET    /api/sites                    # List all sites
POST   /api/sites                    # Create new site
GET    /api/sites/{id}               # Get site details
PUT    /api/sites/{id}               # Update site
DELETE /api/sites/{id}               # Delete site
GET    /api/sites/{id}/staff         # Get staff for site
POST   /api/sites/{id}/staff/{sid}   # Add staff to site
DELETE /api/sites/{id}/staff/{sid}   # Remove staff from site
```

### Staff Management
```
GET    /api/staff                    # List all staff
POST   /api/staff                    # Create new staff
GET    /api/staff/{id}               # Get staff details
PUT    /api/staff/{id}               # Update staff
DELETE /api/staff/{id}               # Delete staff
```

### Meetings
```
GET    /api/meetings                 # List all meetings
POST   /api/meetings                 # Create new meeting
GET    /api/meetings/{id}            # Get meeting details
PUT    /api/meetings/{id}            # Update meeting
DELETE /api/meetings/{id}            # Delete meeting
GET    /api/meetings/site/{id}       # Get meetings for site
```

---

## Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests (if implemented)

```bash
cd frontend
npm run test
```

---

## Troubleshooting

### Docker Issues

**Port Already in Use**
```bash
# If ports 3000 or 8000 are in use, modify docker-compose.yml
# Or kill existing processes:
lsof -ti:3000 | xargs kill -9    # macOS/Linux
netstat -ano | findstr :3000     # Windows
```

**Database Permission Issues**
```bash
# Ensure proper permissions on db_volume
docker volume ls
docker volume inspect ksa-custom-erp-2_db_volume
```

**CORS Errors**
- Backend CORS is configured to accept all origins (`*`)
- In production, restrict to frontend domain in `main.py`

### API Not Responding

```bash
# Check backend container logs
docker-compose logs backend

# Test API directly
curl http://localhost:8000/health
```

### Frontend Can't Connect to Backend

- Verify `VITE_API_BASE_URL` environment variable
- Check network connectivity between containers
- Review browser console for CORS errors

---

## File Structure

```
ksa-custom-erp-2/
├── backend/
│   ├── app/
│   │   ├── models/          # ORM models
│   │   ├── schemas/         # Pydantic validators
│   │   ├── crud/            # Database operations
│   │   ├── api/endpoints/   # API routes
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page views
│   │   ├── api/             # API client
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── index.html
├── docker-compose.yml
└── README.md
```

---

## Next Steps

1. **Access Dashboard:** http://localhost:3000
2. **Add Staff:** Go to "Staff List" and create staff members
3. **Add Sites:** Go to "Sites" and create power stations
4. **Assign Staff:** From site detail, assign staff to sites
5. **Create Meetings:** Go to "Meetings" and create meeting records

---

## Support

For issues or questions, refer to:
- Backend API docs: http://localhost:8000/docs
- Frontend console: Browser Developer Tools (F12)
- Docker logs: `docker-compose logs [service_name]`

---

**System Version:** 1.0.0
**Last Updated:** January 6, 2026
