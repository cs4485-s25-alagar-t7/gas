import { Router } from 'express';
import multer from 'multer';
import CandidatesService from '../services/candidates.service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// Modifies the candidates in the database for a particular semester based on the data in the Excel file
// should update the UTDID based on the matching document ID
// should also update the seniority score and major 
// returns list of UTDIDs that were updated
// POST /api/candidates/upload
router.post('/upload/excel', upload.single('candidatesSheet'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { semester } = req.body;
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }
    const modifiedCandidates = await CandidatesService.bulkModifyCandidatesFromExcel(req.file.buffer, semester);
    res.status(201).json(modifiedCandidates);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Failed to process file', error: error.message });
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
    const newCandidate = await CandidatesService.addCandidate(req.body);
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/candidates/delete-all?semester=spring 2025
router.delete('/delete-all', async (req, res) => {
  try {
    const { semester } = req.query;
    let result;
    if (semester) {
      result = await CandidatesService.deleteAllBySemester(semester);
      res.json({ message: `Deleted all data for semester ${semester} (candidates: ${result.candidates}, assignments: ${result.assignments}, sections: ${result.sections})` });
    } else {
      result = await CandidatesService.deleteAll();
      res.json({ message: `Deleted ${result.deletedCount} candidates (all semesters)` });
    }
  } catch (error) {
    console.error('Error deleting all candidates:', error);
    res.status(500).json({ message: 'Failed to delete candidates', error: error.message });
  }
});

// DELETE /api/candidates/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CandidatesService.removeCandidate(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uploads a zip file containing resumes and parses them, returning the results + adding them to the database
// POST /api/candidates/upload
router.post('/upload', upload.single('resumeZip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { semester } = req.body;
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }
    const result = await CandidatesService.processResumeZip(req.file.buffer, semester);
    res.json(result);
  } catch (error) {
    console.error('Error processing zip file:', error);
    res.status(500).json({ 
      message: 'Failed to process resumes', 
      error: error.message,
      stack: error.stack 
    });
  }
});

// GET /api/candidates/semesters
router.get('/semesters', async (req, res) => {
  try {
    const semesters = await CandidatesService.getAllSemesters();
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch semesters', error: error.message });
  }
});

// GET /api/candidates/recent
router.get('/recent', async (req, res) => {
  try {
    const { semester, count } = req.query;
    if (!semester || !count) {
      return res.status(400).json({ message: 'Semester and count are required' });
    }
    const recentCandidates = await CandidatesService.getRecentCandidates(semester, parseInt(count));
    res.json(recentCandidates);
  } catch (error) {
    console.error('Error fetching recent candidates:', error);
    res.status(500).json({ message: 'Failed to fetch recent candidates' });
  }
});

export default router;