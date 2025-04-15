# Meeting Minutes: April 8th
**Team Leader: Ji Min Yoon**\
**Started: 1:37pm**\
**Ended: 2:18pm**\
**Total Minutes: 41 minutes**



## Attendance:
* Present: Arsal Hussain, Sophie Tran, Ji Min Yoon, Solomon Pierce, Rayyan Waris
* Professor Alagar and Thenn present

# Updates: 
- Discussed updated figma designs on all pages
- Walked through resume parsing progress
- Went over API progress
- Got Approval to start implementing Fimga into HTML
- Showed a demo of the database conencting the frontend
- 
  
# Back End Notes
- Document the assignment algorithm:
  - Include explanation of tunable parameters and weight settings.
  - Ensure it’s understandable/editable by hiring managers.
- Support API fetch with pagination, but allow displaying all results in a single view.
- Handle logic for:
  - Carrying over returning graders via the graders Excel sheet.
  - Option (default = true) to auto-import reapplying graders when creating a new semester.
  - Combining Course Number and Section into one field.

# Front End Notes
- Login Screen: Implement login flow.
- Professor View: Rename to Course View.
  - If a professor isn’t assigned, label as “Staff”.
- Course View Page:
  - Add “Add Section” button.
- Assignments Page:
  - Add “Add Course” button.
  - Add “View All” button for full scrollable/paginated list.
  - Add sort-by column headers.
- Select Method in Assignment View:
  - Add AUTO button for automatic assignment.
- Create New Semester UI:
  - Add option to carry over previous graders.
  - Combine Course Number + Section into one field.
- Candidate View Page:
  - Add Candidate Modal:
    - Enable bulk upload with two files: Excel + Resume ZIP.
    - Clarify removal confirmation message for candidates (i.e., “Are you sure you want to permanently remove this candidate?”).
  - Add buttons to Add Course and Add Professor.


# Next Steps
- Finalize UI/UX for bulk candidate upload (dual file input)
- Implement and test AUTO assign button.
- Clean up UI labels (e.g., rename views, add warnings).
- Confirm Excel formatting for grader imports and candidate uploads.
- Write documentation on:
  - Assignment logic
  - API pagination behavior
  - Admin control options in semester creation
