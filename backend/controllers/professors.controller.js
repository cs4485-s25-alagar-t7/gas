import express from 'express';
const router = express.Router();
import { getProfessorView } from '../services/professors.service.js';

router.get('/', async (req, res) => {
  try {
    const { semester } = req.query;
    const data = await getProfessorView(semester);
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch professor view:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
