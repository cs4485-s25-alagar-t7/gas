# Meeting Minutes: March 25
**Team Leader: Sophie Tran**\
**Started: 1:28pm**\
**Ended: 2:25pm**\
**Total Minutes: 57 minutes**



## Attendance:
* Absent: Rayyan Waris
* Present: Arsal Hussain, Sophie Tran, Kevin Yoon, Solomon Pierce
* Professor Alagar and Thenn also present



# Updates: 
- Figma updated to include Candidate, Professor and Course views 
- Removed tools and settings seletion on sidebar as there is no necessity
- All three views allow search and sort/filter, and semester selection
  - Candidate view allows add candidates
  - Professor view specifies mismatch in recommended and assigned candidates
  - Course view allows changing assignments; Choices for change: auto and manual change
- Upload page has been altered to match last meeting request, accepting only pdf and excel sheets

# Back End Notes
- Downloading applications or creating a resume book from handshake (where process will be)
- Found libraries for API for resume building and parsing, only issue is extracting
  - possibly using microservice to parse resume
- Worked on Course, Candidate, and Assignment files, defining the variables and data that will be used

# Front End Notes
- Full Stack is working on integration to HTML
## Dashboard
- Giving Admin ability to start a new semester
- Allow option to give perference to graders from previous semester
  - If "yes" selected, check to see if they are still in candidate pool
## Candidate View
- Make sure to account for candidates that are not being assigned yet
  - Implement another column to display if they have been assigned or not
- Add a function to allow display of candidate information when clicking on candidate's name
## Professor View
- Add in "Add Grader" buttono to add a grader directly to a professor (?)
## Course View
- Need to account for multiple graders for one course
- Add in a selection to change a specific candidate/grader
## Upload Documents
- Account for files from Handshake, or resume files
    
# Professor Alagar Suggestions
- Remove subcategories for "View" and change it to just the main selection 
- Need to account for candidates already assigned, or those that need to be removed
- Remove candidate ID from candidate view to save space
- Possibly incorporate a "assign" feature in candidate view
- Consider changing "Course View" name to Assignment View or something more appropriate

- In database for professor view, the key will be professor name and course name
- Consider standalone product for resume parsing rather than reliability of library

# Thenn Suggestions
- 

# Next Steps
- Update figma accordingly
- Start implementing HTML code
