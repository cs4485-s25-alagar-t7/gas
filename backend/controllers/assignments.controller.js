import express from 'express';
const router = express.Router();
import AssignmentService from '../services/assignments.service.js';

router.get('/', async (req, res) => {
  try {
    const assignments = await AssignmentService.getAllAssignments();
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await AssignmentService.getAssignmentsByCourse(courseId);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/professor/:professorId', async (req, res) => {
  try {
    const { professorId } = req.params;
    const assignments = await AssignmentService.getAssignmentsByProfessor(professorId);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const assignments = await AssignmentService.getAssignmentsByCandidate(candidateId);
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/assign', async (req, res) => {
  try {
    const { candidateId, courseId } = req.body;
    const assignment = await AssignmentService.assignCandidateToSection(candidateId, courseId);
    res.status(201).json({ message: 'Assignment created.', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

export default router;