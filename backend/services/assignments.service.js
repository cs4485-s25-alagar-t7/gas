import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Section from '../models/Section.js';

class AssignmentService {
  static async getAllAssignments(semester) {  
    try {
      const assignments = await Assignment.find({ semester: semester })
        .populate('grader_id')
        .populate('course_section_id')
        .exec();

      // Transform the data to match frontend expectations
      return assignments.map(assignment => ({
        _id: assignment._id,
        section: {
          _id: assignment.course_section_id._id,
          course_name: assignment.course_section_id.course_name,
          section_num: assignment.course_section_id.section_num,
          instructor: {
            name: assignment.course_section_id.instructor.name,
            email: assignment.course_section_id.instructor.netid // Using netid as email since that's what we have
          },
          num_required_graders: assignment.course_section_id.num_required_graders
        },
        assignedCandidate: {
          name: assignment.grader_id.name,
          netid: assignment.grader_id.netid
        },
        semester: assignment.semester,
        status: assignment.status,
        score: assignment.score
      }));
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

  static calculateCandidateScore(candidate, section, weights) {
    const matchingKeywords = Array.isArray(section.keywords) && section.keywords.length > 0
      ? section.keywords.filter(keyword => candidate.resume_keywords.includes(keyword))
      : [];
    const matchingKeywordsRatio = Array.isArray(section.keywords) && section.keywords.length > 0
      ? matchingKeywords.length / section.keywords.length
      : 0;

    const seniorityScore = this.getSeniorityScore(candidate.seniority);
    const experienceScore = candidate.previous_grader_experience ? 1 : 0;

    // Calculate the score based on the weights
    const score = (candidate.gpa * weights.gpa) + 
      (seniorityScore * weights.seniority) +
      (experienceScore * weights.experience) + 
      (matchingKeywordsRatio * weights.keywords);

    console.log(`Candidate ${candidate.name} (${candidate.netid}):`);
    console.log(`  - GPA Score: ${candidate.gpa * weights.gpa}`);
    console.log(`  - Seniority Score: ${seniorityScore * weights.seniority}`);
    console.log(`  - Experience Score: ${experienceScore * weights.experience}`);
    console.log(`  - Keywords Score: ${matchingKeywordsRatio * weights.keywords}`);
    console.log(`  - Total Score: ${score}`);
    console.log(`  - Matching Keywords: ${matchingKeywords.join(', ')}`);

    return score;
  }

  static previousSemester(semester) {
    const [season, year] = semester.split(' ');
    if (season.toLowerCase() === 'spring') {
      return `Fall ${parseInt(year) - 1}`;
    } else if (season.toLowerCase() === 'fall') {
      return `Spring ${year}`;
    }
    return null;
  }

  static async createAssignmentsForSection(sectionId, semester, importPreviousGraders = false) {
    // Delete existing assignments for this section and semester
    await Assignment.deleteMany({ course_section_id: sectionId, semester });

    console.log('\n--- Starting assignment for section ---');
    const section = await Section.findById(sectionId).exec();
    if (!section) {
      console.error('Section not found:', sectionId);
      throw new Error('Section not found');
    }
    console.log(`Processing section: ${section.course_name}.${section.section_num}`);
    console.log(`Number of graders needed: ${section.num_required_graders}`);

    // Get all candidates for the current semester
    const currentSemesterCandidates = await Candidate.find({ semester: semester }).exec();
    console.log('Total current semester candidates found:', currentSemesterCandidates.length);

    // Get previous semester assignments if importPreviousGraders is true
    let previousGraders = [];
    let otherCandidates = currentSemesterCandidates;

    if (importPreviousGraders) {
      const prevSemester = this.previousSemester(semester);
      console.log('Looking for graders from previous semester:', prevSemester);

      // Get all assignments from previous semester to identify previous graders
      const prevAssignments = await Assignment.find({ semester: prevSemester })
        .populate('grader_id')
        .exec();

      // Get netIDs of all graders from previous semester
      const prevGraderNetIds = new Set(
        prevAssignments
          .filter(a => a.grader_id) // Filter out null grader_ids
          .map(a => a.grader_id.netid)
      );

      console.log('Previous semester grader netIDs:', Array.from(prevGraderNetIds));

      // Separate candidates into previous graders and others
      previousGraders = currentSemesterCandidates.filter(c => prevGraderNetIds.has(c.netid));
      otherCandidates = currentSemesterCandidates.filter(c => !prevGraderNetIds.has(c.netid));

      console.log('Found previous graders in current semester:', previousGraders.length);
      console.log('Other candidates:', otherCandidates.length);
    }

    // Get existing assignments for the current semester
    const existingAssignments = await this.getAllAssignments(semester);
    console.log('Existing assignments:', existingAssignments.length);
    
    const assignedCandidateIds = existingAssignments.map(assignment => 
      assignment.assignedCandidate.netid
    );
    console.log('Already assigned candidates:', assignedCandidateIds);
    
    // Filter out already assigned candidates
    const unassignedPreviousGraders = previousGraders.filter(candidate => 
      !assignedCandidateIds.includes(candidate.netid)
    );
    const unassignedOtherCandidates = otherCandidates.filter(candidate => 
      !assignedCandidateIds.includes(candidate.netid)
    );
    
    console.log('Available unassigned previous graders:', unassignedPreviousGraders.length);
    console.log('Available unassigned other candidates:', unassignedOtherCandidates.length);
    
    if (unassignedPreviousGraders.length + unassignedOtherCandidates.length === 0) {
      console.log('No unassigned candidates available');
      throw new Error('No unassigned candidates found for this semester');
    }

    const weights = {
      gpa: 0,
      seniority: 0.2,
      experience: 0.8,
      keywords: 0.3
    };

    // First assign previous graders if available and importPreviousGraders is true
    let selectedAssignments = [];
    if (importPreviousGraders && unassignedPreviousGraders.length > 0) {
      console.log('Assigning previous graders first...');
      const previousGraderAssignments = unassignedPreviousGraders.map(candidate => ({
        candidate,
        score: 2.0 // Give previous graders highest priority
      }));
      selectedAssignments = previousGraderAssignments.slice(0, section.num_required_graders);
      console.log(`Selected ${selectedAssignments.length} previous graders for assignment`);
    }

    // If we still need more graders, assign from other candidates
    if (selectedAssignments.length < section.num_required_graders) {
      console.log('Assigning other candidates to fill remaining slots...');
      const remainingSlots = section.num_required_graders - selectedAssignments.length;
      const otherAssignments = unassignedOtherCandidates.map(candidate => {
        const score = this.calculateCandidateScore(candidate, section, weights);
        return { candidate, score };
      }).sort((a, b) => b.score - a.score)
        .slice(0, remainingSlots);
      
      selectedAssignments = [...selectedAssignments, ...otherAssignments];
      console.log(`Added ${otherAssignments.length} other candidates to fill remaining slots`);
    }

    // Create and save assignments
    const assignments = [];
    for (const { candidate, score } of selectedAssignments) {
      const assignment = new Assignment({
        grader_id: candidate._id,
        course_section_id: section._id,
        status: 'pending',
        semester: semester,
        manuallyAssigned: false,
        score: score
      });

      try {
        await assignment.save();
        console.log(`Created assignment for ${candidate.name} to ${section.course_name}.${section.section_num}`);
        assignments.push(assignment);
      } catch (error) {
        console.error('Error saving assignment:', error);
      }
    }

    // Fill remaining slots with unassigned assignments
    const numToFill = section.num_required_graders - assignments.length;
    for (let i = 0; i < numToFill; i++) {
      const assignment = new Assignment({
        grader_id: null,
        course_section_id: section._id,
        status: 'pending',
        semester: semester,
        manuallyAssigned: false,
        score: 0
      });
      try {
        await assignment.save();
        console.log(`Created unassigned slot for ${section.course_name}.${section.section_num}`);
        assignments.push(assignment);
      } catch (error) {
        console.error('Error saving unassigned assignment:', error);
      }
    }

    console.log(`Completed assignments for section ${section.course_name}.${section.section_num}\n`);
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

  static async createAssignmentsForAllSections(semester, importPreviousGraders = false) {
    console.log('\n=== Starting bulk assignment process ===');
    const sections = await Section.find({ semester: semester }).exec();
    console.log(`Found ${sections.length} sections for semester ${semester}:`);
    sections.forEach(s => console.log(`- ${s.course_name}.${s.section_num} (needs ${s.num_required_graders} graders)`));
    
    if (!sections || sections.length === 0) {
      throw new Error('No sections found for this semester');
    }

    const allAssignments = [];
    for (const section of sections) {
      try {
        console.log(`\nProcessing section ${section.course_name}.${section.section_num}`);
        const sectionAssignments = await this.createAssignmentsForSection(section._id, semester, importPreviousGraders);
        console.log(`Created ${sectionAssignments.length} assignments for section ${section.course_name}.${section.section_num}`);
        allAssignments.push(...sectionAssignments);
      } catch (error) {
        console.error(`Error assigning for section ${section.course_name}.${section.section_num}:`, error.message);
        // Continue with other sections even if one fails
      }
    }

    console.log(`\n=== Bulk assignment complete ===`);
    console.log(`Total assignments created: ${allAssignments.length}`);
    if (allAssignments.length === 0) {
      throw new Error('No assignments could be created');
    }

    return allAssignments;
  }

  static async getAllSectionAssignments(semester) {
    const sections = await Section.find({ semester }).sort({ course_name: 1, section_num: 1 });
    const assignments = await Assignment.find({ semester }).populate('grader_id').populate('course_section_id');

    // Map sectionId to an array of assignments, sorted by _id
    const assignmentMap = {};
    assignments.forEach(a => {
      const key = a.course_section_id._id.toString();
      if (!assignmentMap[key]) assignmentMap[key] = [];
      assignmentMap[key].push(a);
    });

    // Sort assignments for each section by _id to keep order consistent
    Object.values(assignmentMap).forEach(arr => arr.sort((a, b) => String(a._id).localeCompare(String(b._id))));

    // Build the response: one entry per assignment slot
    const result = [];
    sections.forEach(section => {
      const sectionAssignments = assignmentMap[section._id.toString()] || [];
      for (let i = 0; i < section.num_required_graders; i++) {
        const assignment = sectionAssignments[i];
        result.push({
          _id: assignment ? assignment._id : `${section._id}-${i}`,
          section: {
            _id: section._id,
            course_name: section.course_name,
            section_num: section.section_num,
            instructor: {
              name: section.instructor.name,
              email: section.instructor.netid
            },
            num_required_graders: section.num_required_graders
          },
          assignedCandidate: assignment && assignment.grader_id ? {
            name: assignment.grader_id.name,
            netid: assignment.grader_id.netid
          } : null,
          semester: section.semester,
          status: assignment ? assignment.status : null,
          score: assignment ? assignment.score : null
        });
      }
    });
    return result;
  }

  static async swapCandidateInAssignment(assignmentId, candidateId) {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) throw new Error("Candidate not found.");

    // Ensure candidate is not already assigned elsewhere
    const alreadyAssigned = await Assignment.findOne({ grader_id: candidateId });
    if (alreadyAssigned) throw new Error("Candidate is already assigned.");

    // Update the assignment slot
    return Assignment.findByIdAndUpdate(
      assignmentId,
      { grader_id: candidateId, manuallyAssigned: true },
      { new: true }
    );
  }

  static async autoAssignToAssignment(assignmentId) {
    const assignment = await Assignment.findById(assignmentId).populate('course_section_id');
    if (!assignment) throw new Error("Assignment not found.");
    const section = assignment.course_section_id;
    const semester = assignment.semester;

    // Find all candidates for the semester
    const candidates = await Candidate.find({ semester }).exec();
    // Find all assigned candidate IDs for the semester
    const assignedAssignments = await Assignment.find({ semester });
    const assignedCandidateIds = assignedAssignments.map(a => String(a.grader_id));
    // Filter to unassigned candidates
    const unassignedCandidates = candidates.filter(c => !assignedCandidateIds.includes(String(c._id)));
    if (unassignedCandidates.length === 0) throw new Error("No unassigned candidates available");

    // Scoring logic (reuse from createAssignmentsForSection)
    const weights = { gpa: 0.5, seniority: 0.2, experience: 0.8, keywords: 0.3 };
    const scored = unassignedCandidates.map(candidate => {
      const matchingKeywords = section.keywords ? section.keywords.filter(keyword => candidate.resume_keywords.includes(keyword)) : [];
      const matchingKeywordsRatio = section.keywords ? matchingKeywords.length / section.keywords.length : 0;
      const seniorityScore = this.getSeniorityScore(candidate.seniority);
      const experienceScore = candidate.previous_grader_experience ? 1 : 0;
      const score = (candidate.gpa * weights.gpa) + (seniorityScore * weights.seniority) + (experienceScore * weights.experience) + (matchingKeywordsRatio * weights.keywords);
      return { candidate, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (!best) throw new Error("No suitable candidate found");

    // Swap into assignment slot
    assignment.grader_id = best.candidate._id;
    assignment.manuallyAssigned = false;
    await assignment.save();
    return assignment;
  }

  static async unassignCandidate(assignmentId) {
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Set the grader_id to null to unassign the candidate
      assignment.grader_id = null;
      assignment.manuallyAssigned = false;
      assignment.status = 'pending';
      assignment.score = 0;

      await assignment.save();
      return assignment;
    } catch (error) {
      console.error('Error in unassignCandidate:', error);
      throw error;
    }
  }
}

export default AssignmentService;
