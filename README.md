# gas
grader assignment system

## WIP Project Proposal Document Link
- https://docs.google.com/document/d/13gWHLNUOFsziZl8-3A5d8u_b2S7XEat2EZmR9N7_gNM/edit?usp=sharing 


## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-started/get-docker/)

## Setup
To run the mongodb and mongo express admin ui:

1. ``cp template.env .env``
1. fill in a password for the database in the .env file
1. ``docker compose build --no-cache``
1. ``docker compose up``

## Main Features
- View Candidates
- View Sections
- View Professor Recommendations
- Automatically carry over previous graders
    - Click a button to re-assign graders from last semester
- Automatically assign recommended graders
- Automatically score candidates for each section and assign the best match.
- Authentication 
    - WIP 
    - Hardcoded credentials for now


## Matching Algorithm Information

The grader assignment algorithm works based on a weighted sum of attribute scores. 

### Attributes considered:
- Seniority (a.k.a. class standing or school year)
    - sourced from handshake excel sheet
- Prior Grader Experience
    - has the candidate been a TA or grader before?
    - sourced from GAS database & from resume experience
- Keyword matching
    - how many of the section keywords are mentioned in this candidate's resume?
    - candidate keywords sourced from resume
    - section keywords sourced from section/professor excel sheet
- Professor Requests
    - was this candidate recommended/requested by a professor?


### Attributes collected but not currently considered"
- GPA 
    - sourced from resume


```js
const weights = {
  gpa: 0,
  seniority: 0.2,
  experience: 0.8,
  keywords: 0.3
};
```
Path to file containing algorithm weights:
``gas/backend/services/assignments.service.js``

