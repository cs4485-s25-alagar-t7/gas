import express from 'express';
const router = express.Router();
import {getAllAssignments, getAssignmentsByCandidate, getAssignmentsByCourse, getAssignmentsByProfessor, assignCandidateToCourse} from '../services/assignments.service.js';

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
router.get('/course/:courseNumber', getAssignmentsByCourse);
router.get('/professor/:professorName', getAssignmentsByProfessor);
router.get('/candidate/:candidateID', getAssignmentsByCandidate);
router.post('/assign', assignCandidateToCourse);

export default router; // Export the router