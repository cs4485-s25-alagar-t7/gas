import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Candidate from '../models/Candidate.js';

export async function getProfessorView() {
  const courses = await Course.find().lean();

  const assignments = await Assignment.find()
    .populate('grader_id')
    .populate('course_section_id');

  const candidates = await Candidate.find().lean();

  const view = courses.map(course => {
    const matchingAssignment = assignments.find(
      a => a.course_section_id && a.course_section_id._id.toString() === course._id.toString()
    );

    const assignedCandidate = matchingAssignment?.grader_id?.name || "—";
    const recommendedCandidate = candidates.find(c => {
      return c.resume_keywords.some(k => course.keywords.includes(k));
    })?.name || "—";

    const available = candidates.some(c =>
      c.semester === course.semester &&
      c.classes.includes(course.course_id)
    );

    const reason = !available
      ? "Not in Candidate Pool"
      : recommendedCandidate === "—"
        ? "-"
        : assignedCandidate !== recommendedCandidate
          ? "Candidate assigned to different course"
          : "";

    return {
      professorName: course.instructor.name, 
      courseNumber: course.course_id,
      section: course.section_id,
      assignedCandidate,
      recommendedCandidate,
      available,
      reason
    };
  });

  return view;
}
