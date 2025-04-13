import express from 'express';
import {
  getAllAssignments,
  getAssignmentsByCandidate,
  getAssignmentsByCourse,
  getAssignmentsByProfessor,
  assignCandidateToCourse,
  deleteAssignment
} from '../services/assignments.service.js';

const router = express.Router();

router.get('/', getAllAssignments); // ✅ direct ref to function

router.get('/course/:courseNumber', getAssignmentsByCourse);
router.get('/professor/:professorName', getAssignmentsByProfessor);
router.get('/candidate/:candidateID', getAssignmentsByCandidate);
router.post('/assign', assignCandidateToCourse);
router.delete('/:id', deleteAssignment); // pass id via req.params

export default router;
