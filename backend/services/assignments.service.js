const assignments = [
  { id: 1, name: 'Assignment 1', dueDate: '2025-03-10' },
  { id: 2, name: 'Assignment 2', dueDate: '2025-03-15' }
];

const getAllAssignments = async () => {
  return assignments;
};

module.exports = { getAllAssignments };
