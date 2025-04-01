const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  grader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  course_section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  semester: { type: String, required: true },
  score: { type: Number, default: 0 },
  manuallyAssigned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
