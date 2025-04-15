import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Course from '../models/Course.js';

class AssignmentService {
  static async getAllAssignments() {
    try {
      return await Assignment.find();
    } catch (err) {
      console.error("Error in getAllAssignments", err);
      throw err;
    }
  }

  static async getAssignmentsByCourse(courseId) {
    return await Assignment.find({ course_section_id: courseId });
  }

  static async getAssignmentsByProfessor(professorId) {
    return await Assignment.find({ professorId });
  }

  static async getAssignmentsByCandidate(candidateId) {
    return await Assignment.find({ candidateId });
  }

  static async assignCandidateToSection(candidateId, courseId) {
    const candidate = await Candidate.findOne({ candidateID: candidateId });
    const course = await Course.findOne({ course_id: courseId });

    if (!candidate || !course) {
      throw new Error("Candidate or Course not found.");
    }

    const assignment = new Assignment({
      candidate: candidate._id,
      course: course._id,
      manuallyAssigned: true,
    });

    candidate.assignedCourse = course._id;
    await candidate.save();

    course.assignedCandidates.push(candidate._id);
    await course.save();

    return assignment.save();
  }

  static async createAssignmentsForSection(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const candidates = await Candidate.find();
    const prevAssignments = await Assignment.find({ semester: previousSemester(course.semester) });
    const prevCandidates = prevAssignments.map(assignment => assignment.candidate);

    const assignments = [];

    for (const candidate of candidates) {
      if (prevCandidates.includes(candidate._id)) continue;

      const score =
        (candidate.gpa * weights.gpa) +
        ((candidate.seniority === 'Masters' ? 1 : 0) * weights.seniority) +
        (candidate.previous_grader_experience ? weights.experience : 0) +
        (candidate.resume_keywords.filter(keyword => course.keywords.includes(keyword)).length * weights.keywords);

      const assignment = new Assignment({
        candidate: candidate._id,
        course: course._id,
        status: 'pending',
        semester: course.semester,
        score,
        manuallyAssigned: false,
      });

      candidate.assignedCourse = course._id;
      await candidate.save();

      course.assignedCandidates.push(candidate._id);
      await course.save();

      assignments.push(await assignment.save());
    }

    return assignments;
  }

  static async deleteAssignment(assignmentId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

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

  static async assignReturningCandidates(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const prevCandidates = await Candidate.find({ semester: previousSemester(course.semester) });
    const candidates = prevCandidates.filter(candidate => !candidate.assignedCourse);

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

  static previousSemester(semester) {
    const [term, year] = semester.split(' ');
    const semesterYear = parseInt(year);

    if (term === 'spring') {
      return `fall ${semesterYear - 1}`;
    } else if (term === 'fall') {
      return `spring ${semesterYear}`;
    }
  }
}

export default AssignmentService;


