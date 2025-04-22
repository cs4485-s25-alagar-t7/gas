import { Router } from 'express';
const router = Router();
import CandidatesService from '../services/candidates.service.js';

// GET /api/candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await CandidatesService.getCandidates(req.query);
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// GET /api/candidates/candidate/:netId
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

// POST /api/candidates
router.post('/', async (req, res) => {
  try {
    const newCandidate = await addCandidate(req.body);
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/candidates/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await removeCandidate(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
