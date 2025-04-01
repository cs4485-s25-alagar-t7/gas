const express = require('express');
const router = express.Router();
const service = require('../services/assignments.service');

// GET all assignments
router.get('/', service.getAllAssignments);

// GET assignments by course number
router.get('/course/:courseNumber', service.getAssignmentsByCourse);

// GET assignments by professor name
router.get('/professor/:professorName', service.getAssignmentsByProfessor);

// GET assignments by candidate ID
router.get('/candidate/:candidateID', service.getAssignmentsByCandidate);

// POST to assign a candidate to a course
router.post('/assign', service.assignCandidateToCourse);

module.exports = router;
