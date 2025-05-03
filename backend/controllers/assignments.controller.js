import express from 'express';
const router = express.Router();
import AssignmentService from '../services/assignments.service.js';

// Get all assignments for a specific semester
router.get('/', async (req, res) => {
  const { semester } = req.query;
  try {
    const assignments = await AssignmentService.getAllSectionAssignments(semester);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assignments for a specific course (section)
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId, semester } = req.params;
    const assignments = await AssignmentService.getAssignmentsBySection(courseId, semester);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assignments for a specific professor
router.get('/professor/:professorId', async (req, res) => {
  try {
    const { professorId, semester } = req.params;
    const assignments = await AssignmentService.getAssignmentsByProfessor(professorId, semester);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assignments for a specific candidate
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const assignments = await AssignmentService.getAssignmentsByCandidate(candidateId, semester);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment for a specific course section
router.post('/assign', async (req, res) => {
  try {
    const { candidateId, sectionId, semester } = req.body;
    const assignment = await AssignmentService.assignCandidateToSection(candidateId, sectionId, semester);
    res.status(201).json({ message: 'Assignment created.', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate assignments for a specific course section
router.post('/generate', async (req, res) => {
  try {
    const { sectionId, semester } = req.body;
    const assignments = await AssignmentService.createAssignmentsForSection(sectionId, semester);
    res.status(201).json({ message: 'Assignments created.', assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate assignments for all sections
router.post('/generate-all', async (req, res) => {
  try {
    const { semester, importPreviousGraders } = req.body;
    const assignments = await AssignmentService.createAssignmentsForAllSections(semester, importPreviousGraders);
    res.status(201).json({ message: 'All assignments created.', assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an assignment
router.delete('/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    await AssignmentService.deleteAssignment(assignmentId);
    res.status(200).json({ message: 'Assignment deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Swap candidate in an assignment slot
router.post('/swap', async (req, res) => {
  try {
    const { assignmentId, candidateId } = req.body;
    const assignment = await AssignmentService.swapCandidateInAssignment(assignmentId, candidateId);
    res.status(200).json({ message: 'Assignment updated.', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auto-assign the next best candidate to an assignment slot
router.post('/auto-assign', async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const assignment = await AssignmentService.autoAssignToAssignment(assignmentId);
    res.status(200).json({ message: 'Auto-assigned candidate.', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unassign a candidate from an assignment
router.post('/unassign', async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const assignment = await AssignmentService.unassignCandidate(assignmentId);
    res.status(200).json({ message: 'Candidate unassigned successfully.', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
