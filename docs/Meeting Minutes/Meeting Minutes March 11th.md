# Meeting Minutes 3/11
**Team Leader: Rayyan Waris**

## Attendance:
* Kevin Yoon absent, All other members and Thenn and Prof Alagar present





## updates: 
- Uploading documents page, professor recommendation page
- Set up Dockerfiles for backend, Express.js for assignments
- Resume parsing research

# Back End Notes
- Shared schema in progress for Mongo DB, grader collection, course section collection, assignment collection
- Implemented schema into database

# Front End Notes
- Initially had recommended candidates, after Thenn's input, implemented professor recommendations page separately
- Can replace GPA column to course selection/number for Professor Recommendation
- Created an Upload Candidate Documents

# Professor Alagar Suggestions
- Dashboard will not require calendar, can remove
- Take professor recommendation and check if the candidate has applied or not as part of algorithm
- Consider removal of top border of navigation if the sidebar exists (unnecessary work)
  - recommended by prof candidates just get instant hired for that prof before the algo runs
  - they might not actually apply though so in that case they cant be assigned
- GPA will not be required for factoring in candidates, only need minimum 3.2 average
- View for Uploading Files (make sure they are secure proof)
- As part of input file, include one more column which will be keywords (skillsets for candidate that could match to specific professor)
- Previous semester candidates will run the algorithm on them first (prioritized)

# Thenn Suggestions
- Use True/False column in excel file for determining candidates, as false will only be considered as a backup
- Candidate list (excel), Candidate file/resumes (pdf), Course list (excel)
- upload page should have uploads for candidates excel, courses excel, and merged PDF of all CVs
- Finalized doc for excel sheet, consider three different views (Candidate, Course, Professor)
  - Candidate view will have Candidate ID, name, and Course number (functionality is removing, searching, and adding candidate [CRUD] does not overwrite but adds to candidate pool, search boxes looking at current candidates and assignments, split into semester basis) output will be course name
  - Course view will have Course number, name, number of graders, section, professor name, and the assigned candidate (should be a button to change the assignment manually and show list of candidates available) (auto assign will run algorithm and removed temporary students from pool)
  - Professor View will have Professor Name, Course Name, and Course Number, along with their section number for class, and the Assigned Candidate given, as well as showing the potential recommended candidate (might not match, will need additional column to show explanation why i.e different professor chose candidate)
  - Each view will require a search filter

# Next Steps
- Updating Professor Recommendation page (columns, navigation)
- Updating Candidate documents page, removing Contact info as upload will only be a excel/pdf file
- Testing out connection between containers and backend API
