import { Router } from 'express';
const router = Router();
import CandidatesService from '../services/candidates.service.js';

// get candidates by netId
router.get('/candidate/:netId', async (req, res) => {
    try {
        const { netId } = req.params;
        const candidate = await CandidatesService.getCandidateByNetId(netId);
        res.json(candidate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;