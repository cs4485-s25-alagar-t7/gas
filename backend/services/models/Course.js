import { Schema, model } from 'mongoose';

const courseSchema = new Schema({
    courseNumber: String,
    courseName: String,
    numGraders: Number,
    section: String,
    professorName: String,
    assignedCandidates: [String]
  });
  

export default model('Course', courseSchema);
