import Section from '../models/Section.js'; 
import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';

export async function getProfessorView(semester) {
  // Filter sections by semester if provided
  const query = semester ? { semester } : {};
  
  // Get all assignments first
  const assignments = await Assignment.find(semester ? { semester } : {})
    .populate('grader_id')
    .populate({
      path: 'course_section_id',
      populate: {
        path: 'instructor'
      }
    })
    .lean();

  const candidates = await Candidate.find(semester ? { semester } : {}).lean();

  // Map over assignments instead of sections to ensure we show all assignments
  const view = assignments.map(assignment => {
    const section = assignment.course_section_id;
    if (!section) return null; // Skip if no section data

    const assignedCandidate = assignment.grader_id && assignment.grader_id.name ? assignment.grader_id.name : "";
    if (!assignedCandidate) return null; // Only include if there is an actual name
    let recommendedCandidate = "";
    if (Array.isArray(section.requested_candidate_UTDIDs) && section.requested_candidate_UTDIDs.length > 0) {
      // WHY ARE MULTIPLE CHECKS NEEDED? DONT WE JUST SHOW THE RECOMMENDED STUDENTS TO THE FRONTEND DIRECTLY?
      // WHAT IF THERE ARE INVALID STRINGS? SHOULD BURDEN OF VALIDATION OF RECOMMENDED CANDIDATES FALL ON THE USER?  

      // const utdid = section.requested_candidate_UTDIDs[0].trim();
      // const candidate = candidates.find(c => String(c.netid).trim() === utdid);
      // if (candidate) {
      //   recommendedCandidate = candidate.name;
      // } else if (Array.isArray(section.recommended_candidate_names) && section.recommended_candidate_names.length > 0) {
      //   // Use the name from the section if not in the pool
      //   recommendedCandidate = section.recommended_candidate_names;
      //   console.log("Recommended candidate for frontend", recommendedCandidate);
      // } else {
      //   recommendedCandidate = utdid;
      // }

      // SKIPPING THESE FOR NOW:
      recommendedCandidate = section.recommended_candidate_names;
    }

    const available = candidates.some(c =>
      c.semester === section.semester &&
      c.classes?.includes(section.course_name)
    );

    let reason = "";
    if (Array.isArray(section.requested_candidate_UTDIDs) && section.requested_candidate_UTDIDs.length > 0) {
      for (let idx = 0; idx < section.requested_candidate_UTDIDs.length; idx++) {
        const utdid = section.requested_candidate_UTDIDs[idx].trim();
        const candidateInPool = candidates.find(c => String(c.netid).trim() === utdid);
        if (!candidateInPool) {
          reason = "Not in Candidate Pool";
        } else {
          // Find all assignments for this candidate in this semester
          const candidateAssignments = assignments.filter(a => a.grader_id && String(a.grader_id._id) === String(candidateInPool._id));
          const assignedHere = candidateAssignments.some(a => a.course_section_id && String(a.course_section_id._id) === String(section._id));
          if (assignedHere) {
            reason = "";
          } else if (candidateAssignments.length > 0) {
            reason = "Candidate is assigned to another course/section";
          } else {
            reason = "Candidate is in pool but not assigned";
          }
        }
        if (reason) break; // Stop at the first mismatch reason found
      }
    }

    return {
      professorName: section.instructor?.name || "Unknown", 
      courseNumber: section.course_name || "Unknown", 
      section: section.section_num || "Unknown",      
      assignedCandidate,
      recommendedCandidate,
      available,
      reason
    };
  }).filter(Boolean); // Remove any null entries

  return view;
}
