# Kulkoni SA Power Station Management System

A comprehensive web application for managing electricity power stations (sites), staff assignments, and meetings.

## Project Structure

```
ksa-custom-erp-2/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── crud/            # Database operations
│   │   ├── api/
│   │   │   └── endpoints/   # API route handlers
│   ├── main.py              # FastAPI application entry
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API client services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml       # Multi-container orchestration
└── README.md

## Features

- **Site Management:** Create, read, update, and delete power station sites
- **Staff Management:** Manage staff members with roles, email, phone, and surname
- **Site-Staff Linking:** Assign staff members to multiple sites (many-to-many)
- **Meetings:** Create, view, and edit meetings linked to specific sites
  - Schedule meetings with specific date and time
  - Track attendees and absent staff members
  - Manage dynamic agenda items
- **Meeting Items:** Track action items with:
  - Issue description
  - Assigned responsible person (staff member)
  - Target completion date
  - Invoice date (for financial tracking)
  - Payment date (for reconciliation)
- **Dashboard:** Quick overview of sites, staff, and meetings
- **Persistent Database:** SQLite database with Docker volume mounting
- **Full Name Display:** Staff names shown with surname throughout the UI

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Database:** SQLite
- **Containerization:** Docker, Docker Compose

## Development Setup

### Backend

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Backend API will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Run the dev server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database

The SQLite database is stored in `/app/db/app.db` inside the backend container and is persisted via Docker volume `db_volume`. The database is automatically initialized on first run.

## API Endpoints

### Sites
- `GET /api/sites` - List all sites
- `POST /api/sites` - Create new site
- `GET /api/sites/{id}` - Get site details
- `PUT /api/sites/{id}` - Update site
- `DELETE /api/sites/{id}` - Delete site
- `GET /api/sites/{id}/staff` - Get staff assigned to site
- `POST /api/sites/{id}/staff/{staff_id}` - Add staff to site
- `DELETE /api/sites/{id}/staff/{staff_id}` - Remove staff from site

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create new staff
- `GET /api/staff/{id}` - Get staff details
- `PUT /api/staff/{id}` - Update staff
- `DELETE /api/staff/{id}` - Delete staff

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/{id}` - Get meeting details including items, attendees, apologies
- `PUT /api/meetings/{id}` - Update meeting (all fields including scheduled_at, attendees)
- `DELETE /api/meetings/{id}` - Delete meeting

**Meeting Create/Update Payload:**
```json
{
  "site_id": 1,
  "agenda": "Meeting agenda text",
  "chairperson_staff_id": 1,
  "scheduled_at": "2026-01-10T14:30:00",
  "attendees": "Name1, Name2",
  "apologies": "Name3",
  "items": [
    {
      "issue_discussed": "Item description",
      "person_responsible_staff_id": 2,
      "target_date": "2026-01-15",
      "invoice_date": "2026-01-20",
      "payment_date": "2026-02-05"
    }
  ]
}
```

## Pages

- **Dashboard:** Overview with key metrics and recent activity
- **Sites:** Browse and manage all power stations
- **Site Detail:** View site information, assigned staff, and linked meetings
- **Staff List:** Manage all staff members with surnames
- **Meetings:** Create and manage meetings
  - **List View:** Browse meetings, quick create inline form
  - **Create/Edit:** Full form for scheduling meetings, managing attendees, adding items
  - **Detail View:** View complete meeting information with items, attendees, dates
- **Meeting Items:** Dynamic agenda items with:
  - Issue description
  - Assigned person
  - Target, invoice, and payment dates

## Quick Start for New Features

See [MEETING_FEATURES_QUICKSTART.md](MEETING_FEATURES_QUICKSTART.md) for a detailed guide on:
- Creating and editing meetings
- Scheduling with date/time
- Managing attendees and absences
- Tracking action items with multiple dates

## Implementation Status

See [FEATURE_IMPLEMENTATION_STATUS.md](FEATURE_IMPLEMENTATION_STATUS.md) for:
- Complete feature checklist
- End-to-end test results
- API verification results
- Known limitations and future improvements

## Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

## Environment Variables

### Backend
- `DATABASE_URL`: SQLite connection string (default: `sqlite:///./app.db`)
- `DEBUG`: Debug mode (default: true)
- `ENVIRONMENT`: Environment name (development/production)

### Frontend
- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:8000`)

## Future Enhancements

- User authentication and role-based access control
- Advanced filtering and search capabilities
- Meeting templates and recurring meetings
- Audit logging and activity history
- Email notifications
- Export to PDF/CSV
- Mobile-responsive improvements
- Real-time updates with WebSockets

## License

Proprietary - Kulkoni SA
