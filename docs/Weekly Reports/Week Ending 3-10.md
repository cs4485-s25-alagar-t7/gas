# Weekly Report  
**Week 3/4 - 3/10**  
**Team Leader: Rayyan Waris**

## Team Accomplishments  
### Rayyan Waris
- **Total Hours Worked: 7**
- **Tasks Completed:**
    - Helped setup the intial frontend using CRA 
    - Coded the frontend for dashboard and candidate page
    - Resolved TailwindCSS conflicts with repo
    - Fixed issues with dependencies
- **Tasks For Next Week:**
    - Finish Database Schema and API Endpoints with Arsal and Solomon
    - Work on implementing more figma views with Kevin and Sophie

### Arsal Hussain
- **Total Hours Worked: 8**
- **Tasks Completed:**
    - Set up Dockerfile and Docker Compose on local PC
    - Debugged Docker Compose networking issues and ensured backend communication with MongoDB.
    - Resolved port conflicts and restarted backend container.
    - Created .env file and configured environment variables for the backend.
    - Implemented basic backend server with Express.js.
    - Developed assignments.controller.js and assignments.service.js for handling assignments API.
    - Verified API functionality using curl to check GET /assignments response.
- **Tasks For Next Week:**
    - Expand API, work with Rayyan on backend composition

### Ji Min Yoon
- **Total Hours Worked:** 7 Hours
- **Tasks Completed:**
  - Helped setup the intial frontend using CRA
  - Developed the frontend for the dashboard and candidate pages.
- **Tasks For Next Week:**
  - Improve existing wireframe and work on implementing more figma views with Rayyan and Sophie

### Sophie Tran
- **Total Hours Worked: 5.5**
- **Tasks Completed:**
    - Designed "Upload Documents" Page
    - Modified Recommendated Page to Professor Recommendation Page
    - Added and adjusted various designs on Figma
    - Navigation bar on candidate page
    - Included document option on navigation bar
    - Helped develop frontend code structure for dashboard
- **Tasks For Next Week:**
    - Complete frontend for Upload Documents page
    - Add more features and design to create easier navigation
    - Maybe: focus on design for various devices (mobile, laptop, desktop)
  
### Solomon Pierce
- **Total Hours Worked: 5**
- **Tasks Completed:**
- [ ] refine the API spec
- [ ] create database schema
- [ ] try making some sample data in the collections
- [ ] try some prototype matching algorithms
- [ ] look into resume parsing
	- Open Resume Parser website (open source so we can just use the backend + its already dockerized) https://github.com/xitanggg/open-resume 
	- Python LLM powered parsing API https://github.com/hxu296/nlp-resume-parser (Requires GPT-3)
		- either we pay the subscription/API credits or we have to find a way to run it or another similar enough LLM locally
  			- https://github.com/nomic-ai/gpt4all (one such library)
	- Java classical NLP approach (would need to dockerize) https://github.com/iadityak/resume-parser?tab=readme-ov-file 
 - 
- [ ] also realized we need to figure out how to separate all the resume PDFs
	- Idea 1: split them on the name since thats always at the top https://github.com/psolin/namecrawler 
 		- convert the PDF to JSON or TXT first and then split them on the name (PDFs are not fun to work with programmatically)
- [ ] identify what parts of the resume we are going to look at and use for decisions
	- GPA (higher = better? or threshold value = good enough?)
	- Major
	- Minor
	- Classes taken
 	- Previous grader experience
  	- seniority (based on graduation date)
- **Tasks For Next Week:**
- research software licenses to make sure I can use the code I found for resumes 
- Decide which resume library / tool to use
- local setup (incl. dockerfile) of resume parsing API

