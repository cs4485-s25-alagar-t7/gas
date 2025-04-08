const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  candidateId: String,
  courseId: String,
  professorId: String,
  role: String,
  isReturning: Boolean,
  skillsMatched: [String]
});

module.exports = mongoose.model('Assignment', assignmentSchema);
