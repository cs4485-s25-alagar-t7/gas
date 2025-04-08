import { getAllAssignments as _getAllAssignments } from '../services/assignments.service';
import express from 'express';
const router = express.Router();
import * as service from '../services/assignments.service.js';

// GET all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await service.getAllAssignments();
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET by course
router.get('/course/:courseNumber', service.getAssignmentsByCourse);
router.get('/professor/:professorName', service.getAssignmentsByProfessor);
router.get('/candidate/:candidateID', service.getAssignmentsByCandidate);
router.post('/assign', service.assignCandidateToCourse);

export default router; // Export the router