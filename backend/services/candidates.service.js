import Candidate from '../models/Candidate.js';
import Assignment from '../models/Assignment.js';

class CandidateService {
    static async getCandidates({ semester, unassigned }) {
        const filter = {};
        if (semester) filter.semester = semester;
        if (unassigned !== undefined) filter.unassigned = unassigned === 'true';

        console.log("Candidate filter:", filter);

        const candidates = await Candidate.find(filter);
        const assignments = await Assignment.find(semester ? { semester } : {}).populate('course_section_id');

        console.log("Total candidates:", candidates.length);
        console.log("Total assignments:", assignments.length);

        const result = candidates.map(candidate => {
            const assigned = assignments.find(a => a.grader_id?.toString() === candidate._id.toString());
            return {
                ...candidate.toObject(),
                assignmentStatus: !!assigned,
                course: assigned?.course_section_id || null,
            };
        });

        return result;
    }

    static async addCandidate(candidateData) {
        const newCandidate = new Candidate(candidateData);
        return await newCandidate.save();
    }

    static async removeCandidate(id) {
        return await Candidate.findByIdAndDelete(id);
    }
}

export default CandidateService;