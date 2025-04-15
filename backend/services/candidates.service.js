import Candidate from '../models/Candidate.js';

class CandidatesService {
    // Fetch all candidates
    static async getAllCandidates() {
        try {
            return await Candidate.find();
        } catch (error) {
            throw new Error('Error fetching candidates: ' + error.message);
        }
    }

    // Fetch candidates by netId
    static async getCandidateByNetId(netId) {
        try {
            return await Candidate.find({ netid: netId });
        } catch (error) {
            throw new Error('Error fetching candidates by netId: ' + error.message);
        }
    }

    // Create a new candidate
    static async createCandidate(candidateData) {
        try {
            const candidate = new Candidate(candidateData);
            return await candidate.save();
        } catch (error) {
            throw new Error('Error creating candidate: ' + error.message);
        }
    }

}

export default CandidatesService;