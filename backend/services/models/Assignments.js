const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    courseNumber: String,
    candidateID: String,
    assignedBy: String,
  });
  

module.exports = mongoose.model('Assignment', assignmentSchema);
