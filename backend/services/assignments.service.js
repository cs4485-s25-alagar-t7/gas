import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';
import Section from '../models/Section.js';
import mongoose from 'mongoose';

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

  //TODO: make this customizable by the hiring manager
  static getSeniorityScore(seniority) {
    switch (seniority) {
      case 'Junior':
        return 0.25;
      case 'Senior':
        return 0.5;
      case 'Masters':
        return 1;
      case 'Doctorate':
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

  static async createAssignmentsForSection(sectionId, semester, importPreviousGraders = false, globallyAssignedCandidateIds = new Set()) {
    // Delete existing assignments for this section and semester
    await Assignment.deleteMany({ course_section_id: sectionId, semester });
    await Assignment.deleteMany({ course_section_id: sectionId, semester, grader_id: null });

    console.log('\n--- Starting assignment for section ---');
    const section = await Section.findById(sectionId).exec();
    if (!section) {
      console.error('Section not found:', sectionId);
      throw new Error('Section not found');
    }
    console.log(`Processing section: ${section.course_name}.${section.section_num}`);
    console.log(`Number of graders needed: ${section.num_required_graders}`);

    // Filter to only fully qualified candidates
    const currentSemesterCandidates = await Candidate.find({ semester, fullyQualified: true });
    console.log('Total current semester candidates found:', currentSemesterCandidates.length);

    // 1. Assign recommended/requested candidates first
    let recommendedAssignments = [];
    let recommendedCandidateIds = new Set();
    if (Array.isArray(section.requested_candidate_UTDIDs) && section.requested_candidate_UTDIDs.length > 0) {
      for (const utdid of section.requested_candidate_UTDIDs) {
        const candidate = currentSemesterCandidates.find(c => String(c.netid).trim() === String(utdid).trim());
        if (candidate && !globallyAssignedCandidateIds.has(candidate._id.toString())) {
          recommendedAssignments.push({ candidate, score: 3.0 }); // Highest priority
          recommendedCandidateIds.add(candidate._id.toString());
          globallyAssignedCandidateIds.add(candidate._id.toString());
          if (recommendedAssignments.length >= section.num_required_graders) break;
        }
      }
    }

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
      previousGraders = currentSemesterCandidates.filter(c => prevGraderNetIds.has(c.netid) && !recommendedCandidateIds.has(c._id.toString()));
      otherCandidates = currentSemesterCandidates.filter(c => !prevGraderNetIds.has(c.netid) && !recommendedCandidateIds.has(c._id.toString()));

      console.log('Found previous graders in current semester:', previousGraders.length);
      console.log('Other candidates:', otherCandidates.length);
    } else {
      // Remove recommended from others if not using previous graders
      otherCandidates = currentSemesterCandidates.filter(c => !recommendedCandidateIds.has(c._id.toString()));
    }

    // Get existing assignments for the current section and semester
    const existingAssignments = await Assignment.find({ course_section_id: sectionId, semester });
    const assignedCandidateIds = existingAssignments
      .filter(a => a.grader_id)
      .map(a => a.grader_id.toString());
    console.log('Already assigned candidates for this section:', assignedCandidateIds);
    
    // Filter out already assigned candidates (global)
    const unassignedPreviousGraders = previousGraders.filter(candidate => 
      !globallyAssignedCandidateIds.has(candidate._id.toString())
    );
    const unassignedOtherCandidates = otherCandidates.filter(candidate => 
      !globallyAssignedCandidateIds.has(candidate._id.toString())
    );
    
    console.log('Available unassigned previous graders:', unassignedPreviousGraders.length);
    console.log('Available unassigned other candidates:', unassignedOtherCandidates.length);
    
    if (recommendedAssignments.length + unassignedPreviousGraders.length + unassignedOtherCandidates.length === 0) {
      console.log('No unassigned candidates available');
      throw new Error('No unassigned candidates found for this semester');
    }

    const weights = {
      gpa: 0,
      seniority: 0.2,
      experience: 0.8,
      keywords: 0.3
    };

    // 2. Assign previous graders if available and importPreviousGraders is true
    let selectedAssignments = [...recommendedAssignments];
    if (selectedAssignments.length < section.num_required_graders && importPreviousGraders && unassignedPreviousGraders.length > 0) {
      console.log('Assigning previous graders next...');
      const previousGraderAssignments = unassignedPreviousGraders.map(candidate => ({
        candidate,
        score: 2.0 // Priority below recommended
      }));
      const slotsLeft = section.num_required_graders - selectedAssignments.length;
      selectedAssignments = [...selectedAssignments, ...previousGraderAssignments.slice(0, slotsLeft)];
      previousGraderAssignments.slice(0, slotsLeft).forEach(a => globallyAssignedCandidateIds.add(a.candidate._id.toString()));
      console.log(`Selected ${previousGraderAssignments.length} previous graders for assignment`);
    }

    // 3. If we still need more graders, assign from other candidates
    if (selectedAssignments.length < section.num_required_graders) {
      console.log('Assigning other candidates to fill remaining slots...');
      const remainingSlots = section.num_required_graders - selectedAssignments.length;
      const otherAssignments = unassignedOtherCandidates.map(candidate => {
        const score = this.calculateCandidateScore(candidate, section, weights);
        return { candidate, score };
      }).sort((a, b) => b.score - a.score)
        .slice(0, remainingSlots);
      otherAssignments.forEach(a => globallyAssignedCandidateIds.add(a.candidate._id.toString()));
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
        globallyAssignedCandidateIds.add(candidate._id.toString());
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
    let sections = await Section.find({ semester: semester }).exec();
    console.log(`Found ${sections.length} sections for semester ${semester}:`);
    sections.forEach(s => console.log(`- ${s.course_name}.${s.section_num} (needs ${s.num_required_graders} graders)`));
    
    if (!sections || sections.length === 0) {
      throw new Error('No sections found for this semester');
    }

    // Sort sections: those with a non-empty requested_candidate_UTDIDs come first
    sections = sections.sort((a, b) => {
      const aHasRec = Array.isArray(a.requested_candidate_UTDIDs) && a.requested_candidate_UTDIDs.length > 0;
      const bHasRec = Array.isArray(b.requested_candidate_UTDIDs) && b.requested_candidate_UTDIDs.length > 0;
      if (aHasRec === bHasRec) return 0;
      return aHasRec ? -1 : 1;
    });

    const allAssignments = [];
    const globallyAssignedCandidateIds = new Set();
    for (const section of sections) {
      try {
        console.log(`\nProcessing section ${section.course_name}.${section.section_num}`);
        const sectionAssignments = await this.createAssignmentsForSection(section._id, semester, importPreviousGraders, globallyAssignedCandidateIds);
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
    let assignments = await Assignment.find({ semester }).populate('grader_id').populate('course_section_id');

    // Map sectionId to an array of assignments, sorted by _id
    const assignmentMap = {};
    assignments.forEach(a => {
      const key = a.course_section_id._id.toString();
      if (!assignmentMap[key]) assignmentMap[key] = [];
      assignmentMap[key].push(a);
    });

    // Sort assignments for each section by _id to keep order consistent
    Object.values(assignmentMap).forEach(arr => arr.sort((a, b) => String(a._id).localeCompare(String(b._id))));

    // Ensure every section has enough real assignment slots
    for (const section of sections) {
      const sectionAssignments = assignmentMap[section._id.toString()] || [];
      const missing = section.num_required_graders - sectionAssignments.length;
      for (let i = 0; i < missing; i++) {
        const newAssignment = new Assignment({
          grader_id: null,
          course_section_id: section._id,
          status: 'pending',
          semester: section.semester,
          manuallyAssigned: false,
          score: 0
        });
        await newAssignment.save();
        sectionAssignments.push(newAssignment);
        assignments.push(newAssignment);
      }
      assignmentMap[section._id.toString()] = sectionAssignments;
    }

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
    try {
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        throw new Error("Invalid assignment slot ID.");
      }
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) throw new Error("Candidate not found.");

      // Find the assignment slot to update
      const assignmentToUpdate = await Assignment.findById(assignmentId);
      if (!assignmentToUpdate) throw new Error("Assignment slot not found.");
      const semester = assignmentToUpdate.semester;

      // Ensure candidate is not already assigned elsewhere in the same semester (but allow reassigning to this slot)
      const alreadyAssigned = await Assignment.findOne({
        grader_id: candidateId,
        semester: semester,
        _id: { $ne: assignmentId }
      });
      if (alreadyAssigned) {
        console.error(`Candidate ${candidateId} is already assigned to assignment ${alreadyAssigned._id} in semester ${semester}`);
        throw new Error("Candidate is already assigned to another section in this semester.");
      }

      // Update the assignment slot
      assignmentToUpdate.grader_id = candidateId;
      assignmentToUpdate.manuallyAssigned = true;
      await assignmentToUpdate.save();
      return assignmentToUpdate;
    } catch (error) {
      console.error('Error in swapCandidateInAssignment:', error);
      throw error;
    }
  }

  static async autoAssignToAssignment(assignmentId) {
    const assignment = await Assignment.findById(assignmentId).populate('course_section_id');
    if (!assignment) throw new Error("Assignment not found.");
    const section = assignment.course_section_id;
    const semester = assignment.semester;

    // Find all fully qualified candidates for the semester
    const candidates = await Candidate.find({ semester, fullyQualified: true }).exec();
    // Find all assigned candidate IDs for the semester
    const assignedAssignments = await Assignment.find({ semester });
    const assignedCandidateIds = assignedAssignments.map(a => String(a.grader_id));
    // Filter to unassigned candidates
    const unassignedCandidates = candidates.filter(c => !assignedCandidateIds.includes(String(c._id)));
    if (unassignedCandidates.length === 0) throw new Error("No unassigned candidates available");

    // Scoring logic (reuse from createAssignmentsForSection)
    const weights = { gpa: 0, seniority: 0.2, experience: 0.8, keywords: 0.3 };
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

  /**
   * Checks that all recommended candidate IDs from the section input file are present in the database for the given semester.
   * Logs any missing recommended candidates.
   * @param {Array<string>} recommendedCandidateIds - Array of recommended candidate UTDIDs from the section input file
   * @param {string} semester - The semester to check
   */
  static async verifyRecommendedCandidatesInDatabase(recommendedCandidateIds, semester) {
    // Fetch all candidate netids for the semester
    const candidates = await Candidate.find({ semester }).select('netid').lean();
    const candidateNetids = new Set(candidates.map(c => String(c.netid).trim()));
    const missing = recommendedCandidateIds.filter(id => !candidateNetids.has(String(id).trim()));
    if (missing.length > 0) {
      console.warn(`Recommended candidate IDs missing from database for semester ${semester}:`, missing);
    } else {
      console.log('All recommended candidate IDs are present in the database for semester', semester);
    }
    return missing;
  }
}

export default AssignmentService;
