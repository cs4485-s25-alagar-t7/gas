import { Schema, model } from 'mongoose';

const sectionSchema = new Schema({
  course_name: { type: String, required: true },
  section_num: { type: String, required: true },
  instructor: {
    name: { type: String, required: true },
    netid: { type: String, required: true }
  },
  keywords: [{ type: String }],
  semester: { type: String, required: true },
  num_required_graders: { type: Number, required: true },
  requested_candidate_UTDIDs: [{ type: String }],
});

export default model('Section', sectionSchema);
