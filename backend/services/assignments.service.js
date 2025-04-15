import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Section from '../models/Section.js';

class AssignmentService {

  constructor() {
    // Constructor logic if needed
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

  static async assignCandidateToSection(candidateId, sectionId, semester) {
    const candidate = await Candidate.findOne({ _id: candidateId });
    const section = await Section.findOne({ _id: sectionId });

    if (!candidate || !sectionId) {
      throw new Error("Candidate or Section not found.");
    }

    const assignment = new Assignment({
      grader_id: candidate._id,
      course_section_id: sectionId._id,
      manuallyAssigned: true,
      status: 'pending',
      semester: semester,
      score: 0,
    });

    return assignment.save();
  }

  static getSeniorityScore(seniority) {
    switch (seniority) {
      case 'Undergraduate':
        return 0.5;
      case 'Masters':
        return 1;
      case 'PhD':
        return 1.5;
      default:
        return 0;
    }
  }

  static async createAssignmentsForSection(sectionId, semester) {
    const section = await Section.findById(sectionId);
    if (!section) throw new Error('Section not found');

    const candidates = await Candidate.find({ semester: semester });
    if (!candidates || candidates.length === 0) throw new Error('No candidates found for this semester');
    const assignments = [];

    // filter candidates who are not already assigned to a section
    const existingAssignments = await this.getAllAssignments(semester);
    const assignedCandidateIds = existingAssignments.map(assignment => assignment.grader_id.toString());
    const setOfAssignedCandidateIds = new Set(assignedCandidateIds);
    const unassignedCandidates = candidates.filter(candidate => !setOfAssignedCandidateIds.has(candidate._id.toString()));
    if (unassignedCandidates.length === 0) throw new Error('No unassigned candidates found for this semester');

    const weights = {
      gpa: 0.5,
      seniority: 0.2,
      experience: 0.8,
      keywords: 0.3
    }
    for (const candidate of unassignedCandidates) {
      const assignment = new Assignment({
        grader_id: candidate._id,
        course_section_id: section._id,
        status: 'pending',
        semester: semester,
        manuallyAssigned: false,
      });


      const matchingKeywords = section.keywords.filter(keyword => candidate.resume_keywords.includes(keyword));
      const matchingKeywordsRatio = matchingKeywords.length / section.keywords.length;

      const seniorityScore = this.getSeniorityScore(candidate.seniority);
      const experienceScore = candidate.previous_grader_experience ? 1 : 0;

      // Calculate the score based on the weights
      const score = (candidate.gpa * weights.gpa) + (seniorityScore * weights.seniority) +
        (experienceScore * weights.experience) + (matchingKeywordsRatio * weights.keywords);
      // console.log(`Candidate: ${candidate.name}, GPA: ${candidate.gpa},
      //    Seniority: ${candidate.seniority}, Seniority Score: ${seniorityScore},
      //     Experience: ${candidate.previous_grader_experience}, ExperienceScore: ${experienceScore},
      //      Keywords: ${matchingKeywordsRatio}, Score: ${score}`);
      assignment.score = score;

      assignments.push(assignment);
    }

    // take top n scoring candidates where n == section.num_required_graders
    assignments.sort((a, b) => b.score - a.score);
    assignments.splice(section.num_required_graders);
    // save the assignments to the database
    for (const assignment of assignments) {
      await assignment.save();
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


