## Graders Collection
stores grader information

```{
  "_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1a"),
  "name": "John Doe",
  "netid": "jxd100000",
}
```
- subject to change, a lot more fields will be addded to support the algorithm

## Course Sections Collection
stores the course section information
```{
  "_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1b"),
  "course_id": "CS101",
  "section_id": "001",
  "instructor": {
    "name": "Dr. Emily Smith",
    "email": "emily.smith@example.com"
  },
  "semester": "Spring 2025",
}
```

## Assignments Collection
Stores the mappings between graders and sections (supports a Many to Many relationship)
```
{
  "_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1e"),
  "grader_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1a"),
  "course_section_id": ObjectId("60c72b2f9b1d8b5a3c8e4e1b"),
  "status" : "pending"
}
```
`status` can be "pending" or "accepted" based on whether the hiring manager has reviewed this assigment