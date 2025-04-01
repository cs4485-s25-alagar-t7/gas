const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    candidateID: String,
    name: String,
    email: String,
    coursesApplied: [String],
    resume: String,
    recommended: Boolean
  });
  

module.exports = mongoose.model('Candidate', candidateSchema);
