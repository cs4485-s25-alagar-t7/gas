const AssignmentService = require('../services/assignments.service');

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await AssignmentService.getAllAssignments();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllAssignments };
21

// Simulated database interaction
const assignments = [
    { id: 1, grader_id: 1, section_id: 4, status: "pending"},
    { id: 2, grader_id: 2, section_id: 1, status: "pending"},
];

async function getAllAssignments() {
    return assignments;
}

module.exports = { getAllAssignments };

