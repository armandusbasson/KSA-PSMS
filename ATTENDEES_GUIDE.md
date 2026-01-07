# How to Create a Meeting with Attendees

## Overview
The meeting creation form now supports adding attendees and tracking absent staff. This guide explains how to properly use these features.

## Creating a Meeting with Attendees (Inline Form)

The "New Meeting" button on the Meetings page opens a quick create form. Here's how to fill it out:

### Step 1: Select Site
- Click on "Select a site" dropdown
- Choose which power station the meeting is for
- **This field is required**

### Step 2: Add Agenda (Optional)
- Enter meeting topic or description in the Agenda text area
- This is optional but recommended for documentation

### Step 3: Set Meeting Date & Time
- **Date**: Click the date picker and select when the meeting will be held
- **Time**: Click the time picker and set the start time
- Example: "2026-01-15" at "14:30"
- **Both fields are optional** but recommended for scheduling

### Step 4: Add Attendees
⚠️ **IMPORTANT:** This is not automatic - you must explicitly add attendees!

1. Click the "Select staff member to add..." dropdown
2. Choose a staff member from the list (they'll appear with their full name: First + Surname)
3. Click the "Add" button to add them to the attendees list
4. They will appear as a **blue chip** below the dropdown
5. **Repeat** to add more attendees
6. To remove someone, click the **✕** button on their chip

**Example:**
```
Dropdown: [Jane Smith ▼]  [Add]
Selected attendees:
[Jane Smith ✕] [John Doe ✕]
```

### Step 5: Add Absent Staff (Optional)
Similar to attendees:

1. Click the "Select staff member to add..." dropdown
2. Choose a staff member who will be absent
3. Click "Add"
4. They'll appear as a **red chip**
5. Repeat to add more absent staff

### Step 6: Add Meeting Items (Optional)
In the "Meeting Items" section:
1. Click "Add Item" to create a new action item
2. Enter:
   - **Issue**: What needs to be done
   - **Person Responsible**: Select who's in charge (dropdown)
   - **Target Date**: When it should be completed
   - **Invoice Date**: (optional) For billing purposes
   - **Payment Date**: (optional) For payment tracking
3. Remove items with the "Remove" button

### Step 7: Submit
- Click "Create Meeting" to save
- The form will close and you'll see the new meeting in the list

---

## Common Issues & Solutions

### Problem: "Attendees not showing in the meeting"
**Cause**: You didn't add anyone to the attendees list
**Solution**: Make sure to:
1. Click the dropdown
2. Select a staff member
3. Click "Add" button
4. See them appear as a blue chip
5. Then submit the form

❌ **Wrong**: Just selecting in dropdown and submitting (without clicking Add)  
✅ **Right**: Select → Click "Add" → See chip appear → Submit

---

### Problem: "Staff names not appearing in dropdown"
**Cause**: Staff list hasn't loaded yet
**Solution**: 
- Wait a moment and click the dropdown again
- Or reload the page and try again

---

### Problem: "Date/Time not showing in created meeting"
**Cause**: You didn't fill in the date/time fields in the form
**Solution**: Enter both date AND time before submitting

---

## Using the Full Meeting Form

For more detailed editing or creation, click "New Meeting" in the form (if using inline), or navigate directly to `/meetings/new`:

The full form has the **same fields** as the inline form but:
- More space for each field
- Better for adding many items
- Can edit all fields before saving

Steps are identical - just more room to work with.

---

## Editing an Existing Meeting

1. Click the **eye icon** (👁) next to a meeting to view it
2. Click the **pencil icon** (✏️) to edit it
3. The form will pre-populate with:
   - All meeting details
   - Date/Time separated back into inputs
   - Attendees parsed and restored as selections
   - Absent staff parsed and restored as selections
   - All items with their details
4. Make your changes
5. Click "Update Meeting" to save

---

## What Gets Saved

When you create/edit a meeting:

| Field | Saved As | Example |
|-------|----------|---------|
| Site | Site ID | "Kriel Power Station" (stored as ID 1) |
| Agenda | Text | "Safety review and equipment check" |
| Date + Time | ISO DateTime | "2026-01-15T14:30:00" |
| Attendees | Comma-separated names | "John Doe, Jane Smith, Alice Wonder" |
| Absent Staff | Comma-separated names | "Bob Johnson, Mary Wilson" |
| Meeting Items | Array of objects | Each with issue, person, dates |

---

## Viewing Meeting Details

Click the **eye icon** on any meeting to see the detail page, which displays:

- **Scheduled**: The date/time (formatted as "Jan 15, 2026 2:30 PM")
- **Attendees**: List of who was present
- **Apologies**: List of who was absent
- **Items**: Table showing:
  - What needs to be done (Issue)
  - Who's responsible (Person)
  - Target completion date
  - Invoice date
  - Payment date

---

## Tips & Best Practices

✅ **DO:**
- Add attendees even if just "informational" meetings (helps track participation)
- Set realistic target dates for items
- Use "Person Responsible" to assign clear ownership
- Mark absent staff so you have a record

❌ **DON'T:**
- Leave attendees empty if people actually attended (they won't show as participants)
- Set target dates before the meeting date
- Forget to click "Add" after selecting an attendee (just selecting isn't enough!)

---

## FAQ

**Q: Can the same person be both an attendee and absent?**  
A: Yes, but it doesn't make sense. The system stores them separately, so you could add someone as both, but you probably shouldn't.

**Q: Are attendees required?**  
A: No. You can create a meeting without any attendees.

**Q: What if a staff member changes their name?**  
A: The attendee list will show their old name (it's stored as text, not an ID). Their actual staff record will update, but past meeting records keep the names as they were when recorded.

**Q: Can I see which meetings a person attended?**  
A: Not yet - that's a future feature. For now, you'd need to look at individual meetings.

**Q: What's the difference between "Attendees" and "Absent Staff"?**  
A: Attendees = people who were at the meeting  
Absent Staff = people who were supposed to be there but weren't

---

## Getting Help

If attendees still aren't showing:
1. Check the browser console (F12 → Console) for errors
2. Verify you clicked "Add" after selecting someone
3. Make sure staff are loaded (non-empty dropdown)
4. Try refreshing the page and creating a new meeting

Contact support with a screenshot if the issue persists.
