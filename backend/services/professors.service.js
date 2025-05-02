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

    const assignedCandidate = assignment.grader_id?.name || "—";
    let recommendedCandidate = "";
    if (Array.isArray(section.requested_candidate_UTDIDs) && section.requested_candidate_UTDIDs.length > 0) {
      const utdid = section.requested_candidate_UTDIDs[0].trim();
      const candidate = candidates.find(c => String(c.netid).trim() === utdid);
      recommendedCandidate = candidate ? candidate.name : "";
    }

    const available = candidates.some(c =>
      c.semester === section.semester &&
      c.classes?.includes(section.course_name)
    );

    let reason = "";

    // Enhanced mismatch handling
    if (Array.isArray(section.requested_candidate_UTDIDs) && section.requested_candidate_UTDIDs.length > 0) {
      // For each requested UTD ID, check candidate pool and assignment
      for (const utdid of section.requested_candidate_UTDIDs) {
        const candidateInPool = candidates.find(c => String(c.netid).trim() === String(utdid).trim());
        if (!candidateInPool) {
          reason = "Not in Candidate Pool";
          break;
        } else {
          // Check if this candidate is assigned to this section
          if (assignment.grader_id && String(candidateInPool._id) === String(assignment.grader_id._id)) {
            reason = "";
          } else {
            reason = "Candidate is assigned to another course/section";
            break;
          }
        }
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
