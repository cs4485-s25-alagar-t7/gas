import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Course from '../models/Course.js';

// ✅ GET ALL ASSIGNMENTS
async function getAllAssignments(req, res) {
  try {
    const assignments = await Assignment.find()
      .populate('course_section_id')
      .populate('grader_id');

    const result = assignments
      .filter(a => a.course_section_id && a.grader_id)
      .map(a => ({
        _id: a._id,
        course: a.course_section_id,
        assignedCandidate: a.grader_id
      }));
    console.log('📦 Populated assignments:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("Error in getAllAssignments", err);
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
}

// ✅ BY COURSE
async function getAssignmentsByCourse(req, res) {
  try {
    const { courseNumber } = req.params;
    const assignments = await Assignment.find()
      .populate('course_section_id')
      .populate('grader_id');
    const filtered = assignments.filter(a => a.course_section_id.course_id === courseNumber);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error fetching by course", error: err.message });
  }
}

// ✅ BY PROFESSOR
async function getAssignmentsByProfessor(req, res) {
  try {
    const { professorName } = req.params;
    const assignments = await Assignment.find()
      .populate('course_section_id')
      .populate('grader_id');
    const filtered = assignments.filter(a => a.course_section_id.instructor.name === professorName);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error fetching by professor", error: err.message });
  }
}

// ✅ BY CANDIDATE
async function getAssignmentsByCandidate(req, res) {
  try {
    const { candidateID } = req.params;
    const assignments = await Assignment.find()
      .populate('course_section_id')
      .populate('grader_id');
    const filtered = assignments.filter(a => a.grader_id.netid === candidateID);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error fetching by candidate", error: err.message });
  }
}

// ✅ MANUAL ASSIGNMENT
// Assign a candidate to a course
async function assignCandidateToCourse(req, res) {
  const { candidateID, courseNumber, sectionID } = req.body;

  const candidate = await Candidate.findOne({ netid: candidateID });
  const course = await Course.findOne({ course_id: courseNumber, section_id: sectionID });

  if (!candidate || !course) {
    return res.status(404).json({ message: "Candidate or Course not found." });
  }

  // Remove any existing assignment for this course
  const existingAssignment = await Assignment.findOne({ course_section_id: course._id });
  if (existingAssignment) {
    await Assignment.findByIdAndDelete(existingAssignment._id);
  }

  // Prevent assigning candidate if already assigned
  const alreadyAssigned = await Assignment.findOne({ grader_id: candidate._id });
  if (alreadyAssigned) {
    return res.status(400).json({ message: "Candidate is already assigned to another course." });
  }

  const newAssignment = new Assignment({
    grader_id: candidate._id,
    course_section_id: course._id,
    manuallyAssigned: true,
    semester: course.semester,
    status: "accepted"
  });

  await newAssignment.save();
  return res.status(201).json({ message: "Assignment created", assignment: newAssignment });
}


// ✅ AUTO ASSIGNMENT
const weights = {
  gpa: 1,
  seniority: 0.25,
  experience: 0.5,
  keywords: 0.5
};

async function createAssignmentsForSection(courseId) {
  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');

  const candidates = await Candidate.find({ semester: course.semester });
  const assignments = [];

  for (const candidate of candidates) {
    const score =
      (candidate.gpa * weights.gpa) +
      ((candidate.seniority === 'Masters' ? 1 : 0) * weights.seniority) +
      (candidate.previous_grader_experience ? weights.experience : 0) +
      (candidate.resume_keywords.filter(k => course.keywords.includes(k)).length * weights.keywords);

    const assignment = new Assignment({
      grader_id: candidate._id,
      course_section_id: course._id,
      score,
      manuallyAssigned: false,
      semester: course.semester
    });

    assignments.push(await assignment.save());
  }

  return assignments;
}

// ✅ DELETE
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }
    await assignment.deleteOne();
    res.status(200).json({ message: "Assignment deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting assignment", error: err.message });
  }
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
