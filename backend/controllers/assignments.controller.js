import express from 'express';
const router = express.Router();
import {
  getAllAssignments,
  getAssignmentsByCandidate,
  getAssignmentsByCourse,
  getAssignmentsByProfessor,
  deleteAssignment,
  assignCandidateToSection
} from '../services/assignments.service.js';

// GET all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await getAllAssignments();
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET by course
router.get('/course/:courseId', getAssignmentsByCourse);
router.get('/professor/:professorId', getAssignmentsByProfessor);
router.get('/candidate/:candidateId', getAssignmentsByCandidate);
router.post('/assign', assignCandidateToSection);
router.delete('/', deleteAssignment);

export default router; // Export the router