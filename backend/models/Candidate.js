import { Schema, model } from 'mongoose';

const candidateSchema = new Schema({
  name: { type: String, required: true },
  netid: { type: String, required: true },
  gpa: { type: Number, required: true },
  major: { type: String, required: true },
  minor: { type: String },
  classes: [{ type: String }],
  previous_grader_experience: { type: Boolean, default: false },
  seniority: { type: String, enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Masters', 'Doctorate'], required: true },
  resume_keywords: [{ type: String }],
  semester: { type: String, required: true },
  fullyQualified: { type: Boolean, default: false }
});

candidateSchema.index({ netid: 1, semester: 1 }, { unique: true });

export default model('Candidate', candidateSchema);
