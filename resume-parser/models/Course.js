const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_id: { type: String, required: true },
  section_id: { type: String, required: true },
  instructor: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  keywords: [{ type: String }],
  semester: { type: String, required: true },
  num_required_graders: { type: Number, required: true }
});

module.exports = mongoose.model('Course', courseSchema);
