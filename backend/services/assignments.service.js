import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Course from '../models/Course.js';

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
  const assignment = new Assignment({
    candidate: candidate._id,
    course: course._id,
    manuallyAssigned: true
  });

  // Update references
  candidate.assignedCourse = course._id;
  await candidate.save();

  course.assignedCandidates.push(candidate._id);
  await course.save();

  return assignment.save();
}

const weights = {
  gpa: 1,
  seniority: 0.25,
  experience: 0.5,
  keywords: 0.5
};

// Create assignments for all candidates for a specific course section
async function createAssignmentsForSection(courseId) {
  const course = await Course.find(courseId);
  if (!course) throw new Error('Course not found');

  const candidates = await _findAllCandidates(); // Fetch all candidates
  // filter out candidates who are already assigned to a course
  const unassignedCandidates = candidates.filter(candidate => !candidate.assignedCourse);
  if (unassignedCandidates.length === 0) throw new Error('No unassigned candidates found');
  const assignments = [];

  for (const candidate of unassignedCandidates) {
    // Calculate weighted score
    const score = 
      (candidate.gpa * (weights.gpa || 0)) +
      ((candidate.seniority === 'Masters' ? 1 : 0) * (weights.seniority || 0)) +
      (candidate.previous_grader_experience ? (weights.experience || 0) : 0) +
      (candidate.resume_keywords.filter(keyword => course.keywords.includes(keyword)).length * (weights.keywords || 0));

    // Create assignment
    const assignment = new Assignment({
      candidate: candidate._id,
      course: course._id,
      status: 'pending', // Default status
      semester: course.semester,
      score,
      manuallyAssigned: false,
    });

    // Update references
    candidate.assignedCourse = course._id;
    await candidate.save();

    course.assignedCandidates.push(candidate._id);
    await course.save();

    assignments.push(await assignment.save());
  }

  return assignments;
}

// Delete an assignment
async function deleteAssignment(assignmentId) {
  const assignment = await Assignment.find(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  // Cleanup references
  const candidate = await Candidate.find(assignment.candidate);
  const course = await Course.find(assignment.course);

  if (candidate) {
    candidate.assignedCourse = null;
    await candidate.save();
  }

  if (course) {
    course.assignedCandidates = course.assignedCandidates.filter(
      id => id.toString() !== candidate._id.toString()
    );
    await course.save();
  }

  return assignment.deleteOne();
}

export {
  getAllAssignments,
  getAssignmentsByCourse,
  getAssignmentsByProfessor,
  getAssignmentsByCandidate,
  assignCandidateToCourse,
  createAssignmentsForSection,
  deleteAssignment
};


