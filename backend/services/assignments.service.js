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
  const { courseId } = req.params;
  const assignments = await Assignment.find({ course_section_id : courseId });
  res.json(assignments);
}

// Get assignments by professor name
async function getAssignmentsByProfessor(req, res) {
  const { professorId } = req.params;
  const assignments = await Assignment.find({ professorId: professorId });
  res.json(assignments);
}

// Get assignments by candidate ID
async function getAssignmentsByCandidate(req, res) {
  const { candidateId } = req.params;
  const assignments = await Assignment.find({ candidateId: candidateId });
  res.json(assignments);
}

// Assign a candidate to a course
async function assignCandidateToSection(req, res) {
  const { candidateId, courseId } = req.body;

  // Check if candidate and course exist
  const candidate = await Candidate.findOne({ candidateID: candidateId });
  const course = await Course.findOne({ course_id: courseId });

  if (!candidate || !course) {
    return res.status(404).json({ message: "Candidate or Course not found." });
  }

  // Create assignment
  const newAssignment = new Assignment({
    candidateID: candidateId,
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
  // find assignments from the previous semester
  const prev_assignments = await Assignment.find({ semester: previousSemester(course.semester) });
  const prev_candidates = prev_assignments.map(assignment => assignment.candidate);

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

async function assignReturningCandidates(courseId) {
  const course = await Course.find(courseId);
  if (!course) throw new Error('Course not found');

  const prev_candidates = await Candidate.find({ semester: previousSemester(course.semester) });
  if (!candidates || candidates.length === 0) throw new Error('No candidates found for the previous semester');

  // filter candidates that had an assignment in the previous semester
  const candidates = prev_candidates.filter(candidate => candidate.assigned === false);
  if (candidates.length === 0) throw new Error('No candidates found for the previous semester');

  const assignments = [];

  for (const candidate of candidates) {
    const assignment = new Assignment({
      candidate: candidate._id,
      course: course._id,
      status: 'pending',
      semester: course.semester,
      manuallyAssigned: false,
    });

    assignments.push(await assignment.save());
  }

  return assignments;
}

async function previousSemester(semester) {
  const currentSemester = semester.split(' ');
  const semesterYear = parseInt(currentSemester[1]);
  const semesterTerm = currentSemester[0];

  if (semesterTerm === 'spring') {
    return `fall${semesterYear - 1}`;
  } else if (semesterTerm === 'fall') {
    return `spring${semesterYear}`;
  }
}

export {
  getAllAssignments,
  getAssignmentsByCourse,
  getAssignmentsByProfessor,
  getAssignmentsByCandidate,
  assignCandidateToSection,
  createAssignmentsForSection,
  deleteAssignment,
  assignReturningCandidates
};


