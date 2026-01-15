# Meeting Management Features - Quick Start Guide

This guide covers the new meeting management features including scheduling, attendee tracking, and detailed item management.

---

## Starting the Application

```bash
# Start all services (backend + frontend)
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
```

---

## Creating a Meeting

### Step 1: Navigate to Meetings
Click "Meetings" in the navigation menu to view the meetings list.

### Step 2: Open Create Form
Click the "New Meeting" button (top right).

### Step 3: Fill in Meeting Details

#### Basic Information
- **Site**: Select the power station/site (required)
- **Agenda**: Optional text describing the meeting purpose
- **Chairperson**: Select who will chair the meeting
- **Meeting Date & Time**: Set the scheduled date and time for the meeting

#### Attendee Tracking
- **Attendees**: 
  1. Select a staff member from the dropdown
  2. Click "Add" button
  3. Repeat for all attendees
  4. Staff names appear as chips; click ✕ to remove
  
- **Absent Staff**:
  1. Select a staff member who will not attend
  2. Click "Add" button
  3. Same chip interface for managing absences

#### Meeting Items (Issues/Actions)

The meeting can track multiple items/issues. For each item, you can specify:

- **Issue**: Description of the topic/issue discussed (e.g., "Valve maintenance required")
- **Person Responsible**: Select which staff member owns this action
- **Target Date**: When the action should be completed
- **Invoice Date**: When an invoice is expected (if applicable)
- **Payment Date**: Expected payment date (if applicable)

To add items:
1. Click "Add Item" to create a new row
2. Fill in the issue description
3. Select the responsible person from the dropdown
4. Enter any relevant dates
5. Repeat for additional items
6. Click the remove button (trash icon) to delete an item

### Step 4: Save the Meeting

Click "Create Meeting" to save. You'll be redirected to the meeting detail page.

---

## Viewing a Meeting

### Accessing Meeting Details
- Click the **eye icon** next to any meeting in the list, OR
- Click the meeting ID

### What You'll See
The meeting detail page displays:

- **Meeting Information**:
  - Meeting ID and creation timestamp
  - Site name (clickable to view site details)
  - Chairperson name
  - Agenda text
  - Scheduled date and time (formatted as: Jan 10, 2026 2:30 PM)

- **Attendees & Absences**:
  - List of staff who attended
  - List of staff who were absent

- **Items Table**:
  - Columns: Issue | Person Responsible | Target Date | Invoice Date | Payment Date
  - All items from the meeting displayed in a clear table format

### Actions
- **Edit**: Click "Edit" to modify the meeting
- **Back**: Click "Back" to return to the meetings list

---

## Editing a Meeting

### Accessing Edit Mode
Click the **pencil icon** next to a meeting in the list, OR
Click "Edit" from the meeting detail page.

### Making Changes
The edit form works identically to the create form:
- All existing data is pre-populated
- Modify any field
- Add or remove attendees (chips)
- Add, remove, or modify items
- Update dates as needed

### Saving Changes
Click "Update Meeting" to save your changes. You'll be redirected back to the meeting detail page.

---

## Meeting Dates: Understanding the Three-Date System

Each meeting item can track three separate dates:

### 1. **Target Date**
- When the action item should be completed
- Use this for deadline tracking
- Example: "2026-01-20" (20 January 2026)

### 2. **Invoice Date**
- When a vendor/contractor issues an invoice for work done
- Use for financial tracking
- May be blank if no invoice involved

### 3. **Payment Date**
- When payment is due or was made
- Use for accounting reconciliation
- May be blank if no payment required

---

## Staff Management with Surnames

The system now fully supports staff names with optional surnames.

### Adding/Editing Staff
1. Go to "Staff" page
2. Fill in both first name and surname (surname is optional)
3. Staff will display as "FirstName Surname" throughout the system

### Name Display
All dropdowns and lists show the full name (first name + surname):
- Meeting chairperson selection
- Person responsible in meeting items
- Attendee selection
- Absent staff selection

---

## API Examples

If using the REST API directly:

### Create a Meeting
```bash
curl -X POST http://localhost:8000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": 1,
    "agenda": "Safety review",
    "chairperson_staff_id": 1,
    "scheduled_at": "2026-01-10T14:30:00",
    "attendees": "John Doe, Jane Smith",
    "apologies": "Bob Johnson",
    "items": [
      {
        "issue_discussed": "Valve inspection",
        "person_responsible_staff_id": 2,
        "target_date": "2026-01-15",
        "invoice_date": "2026-01-20",
        "payment_date": "2026-02-05"
      }
    ]
  }'
```

### Get Meeting Details
```bash
curl -X GET http://localhost:8000/api/meetings/3 \
  -H "Content-Type: application/json"
```

### Update a Meeting
```bash
curl -X PUT http://localhost:8000/api/meetings/3 \
  -H "Content-Type: application/json" \
  -d '{
    "agenda": "Updated agenda",
    "scheduled_at": "2026-01-15T10:00:00",
    "attendees": "John Doe, Alice Wonder",
    "items": [...]
  }'
```

---

## Tips & Best Practices

1. **Always Set a Meeting Date/Time**: This helps with scheduling and chronological sorting
2. **Use Target Dates**: Set target dates on items to track action item deadlines
3. **Manage Absences**: Keep track of who couldn't attend for follow-up communication
4. **Assign Responsibility**: Always assign action items to specific people
5. **Complete Staff Profiles**: Fill in surnames so full names appear throughout
6. **Track Financials**: Use invoice and payment dates for items requiring vendor work

---

## Troubleshooting

### Meeting Not Saving
- Ensure **Site** is selected (required field)
- Check that the date format is valid
- Verify no network errors in browser console

### Staff Not Appearing in Dropdowns
- Ensure staff members exist in the system
- Check that staff have names entered
- Try refreshing the page

### Attendees Not Appearing in Meeting Detail
- Attendee names must match existing staff names exactly (including surname if provided)
- Names are matched based on formatted full name display

---

## Future Enhancements

Upcoming features planned:
- Email notifications for meeting reminders
- Attachment uploads for meeting documents
- Meeting templates for recurring meetings
- Analytics dashboard for action item completion rates
- Integration with calendar systems (Outlook, Google Calendar)
- Bulk status updates for items
- Meeting minutes/notes editor

---

## Support

For technical issues or feature requests, check the logs:

### Backend Logs
```bash
docker-compose logs backend
```

### Frontend Logs
Open browser developer console (F12) and check:
- Console tab for JavaScript errors
- Network tab for API failures

---

**Last Updated:** 2026-01-06  
**Version:** 1.0.0 (Feature Complete)
