## Graders Collection
stores grader information

```json
{
  "_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1a"),
  "name": "John Doe",
  "netid": "jxd100000",
  "gpa" : 3.3,
  "major" : "Computer Science",
  "minor" : "",
  "classes" : ["CS4301", "CS4337"],
  "previous_grader_experience" : true,
  "seniority" : "Masters",
  "resume_keywords" : ["c++"],
  "semester" : "Spring 2025"
}
```
- subject to change, a fields will be addded/removed to support the algorithm

## Sections Collection
stores the course section information
```json 
{
  "_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1b"),
  "course_name": "CS101",
  "section_num": "001",
  "instructor": {
    "name": "Dr. Emily Smith",
    "netid": "exs132325"
  },
  "keywords" : ["java"],
  "semester": "Spring 2025",
  "num_required_graders" : 2
}
```

## Assignments Collection
Stores the mappings between graders and sections (supports a Many to Many relationship)
```json
{
  "_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1e"),
  "grader_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1a"),
  "course_section_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1b"),
  "status" : "pending",
  "semester" : "Spring 2025"
}
```
`status` can be "pending" or "accepted" based on whether the hiring manager has reviewed this assigment