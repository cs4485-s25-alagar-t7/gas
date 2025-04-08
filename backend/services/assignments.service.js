const Assignment = require('../services/models/Assignments');
const Candidate = require('../services/models/Candidate');
const Course = require('../services/models/Course');
async function getAllAssignments(req, res) {
  try {
    const assignments = await Assignment.find();
    return assignments;
  } catch (err) {
    console.error("Error in getAllAssignments", err);
    throw err;
   }
}

// Get assignments by course number
async function getAssignmentsByCourse(req, res) {
  const { courseNumber } = req.params;
  const assignments = await Assignment.find({ courseNumber });
  res.json(assignments);
}

// Get assignments by professor name
async function getAssignmentsByProfessor(req, res) {
  const { professorName } = req.params;
  const assignments = await Assignment.find({ professorName });
  res.json(assignments);
}

// Get assignments by candidate ID
async function getAssignmentsByCandidate(req, res) {
  const { candidateID } = req.params;
  const assignments = await Assignment.find({ candidateID });
  res.json(assignments);
}

// Assign a candidate to a course
async function assignCandidateToCourse(req, res) {
  const { candidateID, courseNumber } = req.body;

  // Check if candidate and course exist
  const candidate = await Candidate.findOne({ candidateID });
  const course = await Course.findOne({ courseNumber });

  if (!candidate || !course) {
    return res.status(404).json({ message: "Candidate or Course not found." });
  }

  // Create assignment
  const newAssignment = new Assignment({
    candidateID,
    courseNumber,
    professorName: course.professorName,
    assignedAt: new Date()
  });

  await newAssignment.save();
  res.status(201).json({ message: "Assignment created.", assignment: newAssignment });
}

module.exports = {
  getAllAssignments,
  getAssignmentsByCourse,
  getAssignmentsByProfessor,
  getAssignmentsByCandidate,
  assignCandidateToCourse
};
