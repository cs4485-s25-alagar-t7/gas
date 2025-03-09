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
    { id: 1, title: "Assignment 1", dueDate: "2025-03-15" },
    { id: 2, title: "Assignment 2", dueDate: "2025-03-20" }
];

async function getAllAssignments() {
    return assignments;
}

module.exports = { getAllAssignments };

