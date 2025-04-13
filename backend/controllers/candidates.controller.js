import express from 'express';
import {
  getCandidates,
  addCandidate,
  removeCandidate
} from '../services/candidates.service.js';

const router = express.Router();

console.log("🧠 candidates.controller.js loaded");
// GET /api/candidates
router.get('/', async (req, res) => {
    try {
      console.log("🔥 [GET] /api/candidates | Query:", req.query);
      const { semester, unassigned } = req.query;
      const candidates = await getCandidates({ semester, unassigned });
      console.log("Fetched candidates:", candidates.length);
      res.json(candidates);
    } catch (error) {
      console.error("[GET] /api/candidates failed:", error.stack || error.message || error);
      res.status(500).json({ error: "Internal Server Error" });
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
