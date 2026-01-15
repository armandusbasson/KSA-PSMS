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
  - Multiple responsible staff members (many-to-many relationship)
  - Target completion date
  - Invoice date (for financial tracking)
  - Payment date (for reconciliation)
  - Displays all responsible staff as pill badges
- **Contract Management:** Create, update, and track contracts with:
  - Contract type (Supply or Service)
  - Status tracking (Active, Expired, Completed, Cancelled)
  - Reference numbers (Eskom, internal quotation, invoice)
  - Contact information
  - General notes for each contract
  - Document upload and download
  - Dashboard with split view by contract type
- **Dashboard:** Quick overview of sites, staff, meetings, and contracts
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
      "responsible_staff_ids": [2, 3],
      "target_date": "2026-01-15",
      "invoice_date": "2026-01-20",
      "payment_date": "2026-02-05"
    }
  ]
}
```

### Contracts
- `GET /api/contracts` - List all contracts
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/{id}` - Get contract details
- `PUT /api/contracts/{id}` - Update contract
- `DELETE /api/contracts/{id}` - Delete contract
- `GET /api/contracts/summary/by-type` - Get contracts summary split by type
- `POST /api/contracts/{id}/upload` - Upload contract document
- `GET /api/contracts/{id}/download` - Download contract document
- `DELETE /api/contracts/{id}/document` - Delete contract document

**Contract Create/Update Payload:**
```json
{
  "contract_type": "Supply",
  "status": "Active",
  "start_date": "2026-01-01T00:00:00",
  "end_date": "2027-01-01T00:00:00",
  "site_id": 1,
  "responsible_staff_id": 1,
  "eskom_reference": "ESK-123456",
  "contact_person_name": "John Doe",
  "contact_person_telephone": "+27123456789",
  "contact_person_email": "john@example.com",
  "internal_quotation_number": "QT-001",
  "internal_invoice_number": "INV-001",
  "notes": "General notes about the contract"
}
```

## Pages

- **Dashboard:** Overview with key metrics and recent activity
- **Sites:** Browse and manage all power stations
- **Site Detail:** View site information, assigned staff, and linked meetings
- **Staff List:** Manage all staff members with surnames
- **Meetings:** Create and manage meetings
  - **List View:** Browse meetings, quick create inline form with multi-select staff
  - **Create/Edit:** Full form for scheduling meetings, managing attendees, adding items with multi-select responsible staff
  - **Detail View:** View complete meeting information with items displaying all responsible staff as badges
- **Meeting Items:** Dynamic agenda items with:
  - Issue description
  - Multiple responsible staff members (multi-select with add/remove)
  - Target, invoice, and payment dates (aligned in 3-column grid)
- **Contracts:** Browse, create, and manage contracts
  - **List View:** Table view with filtering and status badges
  - **Create/Edit:** Full form with contract details, reference numbers, contact info, and notes
  - **Detail View:** Complete contract information with status, dates, contact details, notes, and document management
  - **Dashboard View:** Split by contract type (Supply vs Service) with summary cards

## Quick Start for New Features

See [MEETING_FEATURES_QUICKSTART.md](MEETING_FEATURES_QUICKSTART.md) for a detailed guide on:
- Creating and editing meetings with multi-staff assignments
- Scheduling with date/time
- Managing attendees and absences
- Tracking action items with multiple responsible staff members
- Using aligned date fields for target, invoice, and payment dates

For contracts, key features include:
- Contract type selection (Supply or Service)
- Status tracking and management
- Reference number tracking (Eskom, internal quotation, invoice)
- Contact person information
- General notes for contract details
- Document upload, download, and management

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
