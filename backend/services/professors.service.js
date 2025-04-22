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
    const recommendedCandidate = candidates.find(c => 
      c.resume_keywords?.some(k => section.keywords?.includes(k))
    )?.name || "—";

    const available = candidates.some(c =>
      c.semester === section.semester &&
      c.classes?.includes(section.course_name)
    );

    let reason = "";
    if (!available) {
      reason = "Not in Candidate Pool";
    } else if (recommendedCandidate !== "—" && assignedCandidate !== recommendedCandidate) {
      reason = "Candidate assigned to different course";
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
