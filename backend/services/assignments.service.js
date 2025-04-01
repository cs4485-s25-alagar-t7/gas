import Assignment from '../models/Assignment';
import Candidate from '../models/Candidate';
import Course from '../models/Course';

// Get all assignments
async function findAllAssignments() {
  return find()
    .populate('candidate')
    .populate({
      path: 'course',
      populate: { path: 'professor' }
    });
}

// Manually assign a candidate to a course
async function createAssignment(candidateId, courseId) {
  const candidate = await _findById(candidateId);
  const course = await __findById(courseId);

  if (!candidate || !course) throw new Error('Candidate or course not found');

  // Create assignment
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
  const course = await __findById(courseId);
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
  const assignment = await findById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  // Cleanup references
  const candidate = await _findById(assignment.candidate);
  const course = await __findById(assignment.course);

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

export default {
  getAllAssignments1,
  createAssignment,
  deleteAssignment,
  createAssignmentsForSection
};


