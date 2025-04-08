const express = require('express');
const router = express.Router();
const service = require('../services/assignments.service');

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

module.exports = router;
