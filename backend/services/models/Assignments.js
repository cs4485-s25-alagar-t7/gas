import { Schema, model } from 'mongoose';

const assignmentSchema = new Schema({
  candidateId: String,
  courseId: String,
  professorId: String,
  role: String,
  isReturning: Boolean,
  skillsMatched: [String]
});

export default model('Assignment', assignmentSchema);
