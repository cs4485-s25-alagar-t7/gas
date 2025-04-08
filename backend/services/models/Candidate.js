import { Schema, model } from 'mongoose';

const candidateSchema = new Schema({
    candidateID: String,
    name: String,
    email: String,
    coursesApplied: [String],
    resume: String,
    recommended: Boolean
  });
  

export default model('Candidate', candidateSchema);
