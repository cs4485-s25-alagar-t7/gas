const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  netid: { type: String, required: true, unique: true },
  gpa: { type: Number, required: true },
  major: { type: String, required: true },
  minor: { type: String },
  classes: [{ type: String }],
  previous_grader_experience: { type: Boolean, default: false },
  seniority: { type: String, enum: ['Undergraduate', 'Masters', 'PhD'], required: true },
  resume_keywords: [{ type: String }],
  semester: { type: String, required: true },
  unassigned: { type: Boolean, default: true }
});

module.exports = mongoose.model('Candidate', candidateSchema);
