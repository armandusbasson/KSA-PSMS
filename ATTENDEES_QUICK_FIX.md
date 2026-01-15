# Quick Summary: Attendees Not Showing - Issue Fixed

## What Was Wrong
When creating meetings, attendees were not appearing in the saved meeting because they weren't being explicitly added in the form.

## What the Issue Was
The meeting creation form has an attendees selection interface that works like this:
1. You select a staff member from a dropdown
2. You MUST click the "Add" button to add them to the meeting
3. They appear as a colored chip
4. Only THEN are they saved when you submit

**The problem**: Users weren't clicking "Add" - they were just selecting from the dropdown and submitting.

## The Fix (UI Improvements)
✅ Made it much clearer how to add attendees:
- Changed prompt text to "Select staff member **to add**..."
- Added "(optional)" label so it's clear this is a user choice
- Show attendees as **blue chips** when added
- Show "No attendees added yet" when the list is empty
- Same color-coded UX for absent staff (red chips)

## How to Use It Correctly

```
1. Click "New Meeting" button
2. Select Site (required)
3. Add Agenda (optional)
4. Set Date & Time (optional but recommended)
5. **To add attendees:**
   a. Click "Select staff member to add..." dropdown
   b. Choose a person (e.g., "Jane Smith")
   c. Click the "Add" button  ← THIS IS THE KEY STEP
   d. See "Jane Smith" appear as a blue chip
   e. Repeat for more people
6. **To mark absent staff:**
   a. Same process but they appear as red chips
7. Click "Create Meeting"
```

## What Gets Saved

When you click "Create Meeting", the form sends:
```json
{
  "site_id": 1,
  "agenda": "meeting topic",
  "scheduled_at": "2026-01-10T14:30:00",
  "attendees": "Jane Smith, John Doe",
  "apologies": "Bob Johnson",
  "items": [...]
}
```

Then when you view the meeting, it displays:
- **Scheduled**: 10 Jan 2026, 2:30 PM
- **Attendees**: Jane Smith, John Doe
- **Apologies**: Bob Johnson
- **Items**: (table with all issues, people, and dates)

## Verification

✅ API works correctly
✅ Date/Time saving works
✅ Attendees saving works IF you click "Add"
✅ UI now makes it much clearer what to do
✅ All data persists correctly through edit cycles

## Files Changed
- `src/pages/MeetingList.tsx` - Better UI with color-coded chips and clearer labels

## Documentation Added
- `ATTENDEES_GUIDE.md` - Complete user guide (read this if you have questions!)
- `ATTENDEES_FIX_EXPLANATION.md` - Technical details of the fix

---

**Key Takeaway**: ⚠️ Don't forget to click "Add" after selecting someone from the attendees dropdown. That's what commits them to the meeting.

The feature is now more obvious and harder to miss!
