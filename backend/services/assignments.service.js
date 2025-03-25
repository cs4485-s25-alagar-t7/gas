const Assignment = require('../models/Assignment');
const Candidate = require('../models/Candidate');
const Course = require('../models/Course');

// Get all assignments
async function getAllAssignments() {
  return Assignment.find()
    .populate('candidate')
    .populate({
      path: 'course',
      populate: { path: 'professor' }
    });
}

// Manually assign a candidate to a course
async function createAssignment(candidateId, courseId) {
  const candidate = await Candidate.findById(candidateId);
  const course = await Course.findById(courseId);

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

// Delete an assignment
async function deleteAssignment(assignmentId) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  // Cleanup references
  const candidate = await Candidate.findById(assignment.candidate);
  const course = await Course.findById(assignment.course);

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

module.exports = {
  getAllAssignments,
  createAssignment,
  deleteAssignment
};
