import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Section from '../models/Section.js';

class AssignmentService {

  constructor() {
    // Constructor logic if needed
  }

  static weights = {
    gpa: 0.5,
    seniority: 0.2,
    experience: 0.2,
    keywords: 0.1
  }

  static async getAllAssignments(semester) {
    try {
      return await Assignment.find({ semester: semester });
    } catch (err) {
      console.error("Error in getAllAssignments", err);
      throw err;
    }
  }

  static async getAssignmentsBySection(sectionId, semester) {
    return await Assignment.find({ course_section_id: sectionId, semester: semester });
  }

  static async getAssignmentsByProfessor(professorId, semester) {
    // Assuming that the professorId is stored in the course section
    // and that the Assignment model has a reference to the course section
    const professors_sections = await Section.find({ instructor: { $elemMatch: { netid: professorId } }, semester: semester });
    const sectionIds = professors_sections.map(section => section._id);
    return await Assignment.find({ course_section_id: { $in: sectionIds } });
  }

  static async getAssignmentsByCandidate(candidateId, semester) {
    return await Assignment.find({ grader_id: candidateId, semester: semester });
  }

  static async assignCandidateToSection(candidateId, section, semester) {
    const candidate = await Candidate.findOne({ _id: candidateId });
    const section = await Section.findOne({ _id: section });

    if (!candidate || !section) {
      throw new Error("Candidate or Section not found.");
    }

    const assignment = new Assignment({
      grader_id: candidate._id,
      course_section_id: section._id,
      manuallyAssigned: true,
      status: 'pending',
      semester: semester,
      score: 0,
    });

    return assignment.save();
  }

  static async createAssignmentsForSection(sectionId, semester, weights) {
    const section = await Section.findById(sectionId);
    if (!section) throw new Error('Section not found');

    const candidates = await Candidate.find();
    const prevAssignments = await Assignment.find({ semester: previousSemester(section.semester) });
    const prevCandidates = prevAssignments.map(assignment => assignment.candidate);

    const assignments = [];

    for (const candidate of candidates) {
      if (prevCandidates.includes(candidate._id)) continue;

      const score =
        (candidate.gpa * weights.gpa) +
        ((candidate.seniority === 'Masters' ? 1 : 0) * weights.seniority) +
        (candidate.previous_grader_experience ? weights.experience : 0) +
        (candidate.resume_keywords.filter(keyword => section.keywords.includes(keyword)).length * weights.keywords);

      const assignment = new Assignment({
        grader_id: candidate._id,
        course_section_id: section._id,
        status: 'pending',
        semester: semester,
        score,
        manuallyAssigned: false,
      });

    }

    return assignments;
  }

  static async deleteAssignment(assignmentId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    return assignment.deleteOne();
  }

  // This function assigns candidates from the previous semester to the current semester
  static async assignReturningCandidates(semester) {
    
    const prevCandidates = await Candidate.find({ semester: previousSemester(semester) });

    const assignments = [];

    for (const candidate of prevCandidates) {
      const assignment = new Assignment({
        candidate: candidate._id,
        course: course._id,
        status: 'pending',
        semester: semester,
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


