import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
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

export default model('Course', courseSchema);
