const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseNumber: String,
    courseName: String,
    numGraders: Number,
    section: String,
    professorName: String,
    assignedCandidates: [String]
  });
  

module.exports = mongoose.model('Course', courseSchema);
