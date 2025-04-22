import { Schema, model } from 'mongoose';

const assignmentSchema = new Schema({
  grader_id: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  course_section_id: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  semester: { type: String, required: true },
  score: { type: Number, default: 0 },
  manuallyAssigned: { type: Boolean, default: false }
});

export default model('Assignment', assignmentSchema);
