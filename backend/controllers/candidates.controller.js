import { Router } from 'express';
import multer from 'multer';
import CandidatesService from '../services/candidates.service.js';
import { parseResume, saveResumeInfoToDB } from '/resume-parser/dist/services/parsing.service.js';
import JSZip from 'jszip';

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
    const newCandidate = await addCandidate(req.body);
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

// POST /api/candidates/upload
router.post('/upload', upload.single('resumeZip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer_length: req.file.buffer.length
    });

    const { semester } = req.body;
    if (!semester) {
      return res.status(400).json({ message: 'Semester is required' });
    }

    // Helper function to generate random values
    const generateRandomValues = (name, id) => {
      const majors = ['Computer Science', 'Software Engineering', 'Computer Engineering', 'Data Science', 'Information Technology'];
      const seniorities = ['Junior', 'Senior', 'Masters', 'Doctorate'];
      
      // Generate a realistic GPA between 3.0 and 4.0
      const gpa = (3.0 + Math.random()).toFixed(2);
      
      return {
        major: majors[Math.floor(Math.random() * majors.length)],
        seniority: seniorities[Math.floor(Math.random() * seniorities.length)],
        gpa: parseFloat(gpa),
        netid: id,
      };
    };

    // Load and validate zip content
    let zipContent;
    try {
      const zip = new JSZip();
      console.log('Loading zip content...');
      zipContent = await zip.loadAsync(req.file.buffer, {
        createFolders: true,
        checkCRC32: true
      });
    } catch (error) {
      console.error('Error loading zip:', error);
      return res.status(400).json({ 
        message: 'Invalid zip file',
        error: error.message
      });
    }

    // Get all files recursively
    const files = [];
    zipContent.forEach((relativePath, file) => {
      if (!file.dir) {
        files.push({
          name: relativePath,
          file: file
        });
      }
    });

    let processedCount = 0;
    let errors = [];

    // Process each PDF file
    for (const { name, file } of files) {
      if (name.toLowerCase().endsWith('.pdf')) {
        try {
          console.log('Processing PDF:', name);
          let pdfBuffer;
          try {
            pdfBuffer = await file.async('nodebuffer');
          } catch (error) {
            console.error('Error extracting PDF buffer:', error);
            errors.push({ filename: name, error: 'Failed to extract PDF: ' + error.message });
            continue;
          }

          let resumeData;
          try {
            // console.log('Parsing resume:', name);
            resumeData = await parseResume(pdfBuffer);

            // Extract name and ID from filename (e.g., "Douglas_Lewis_559082.pdf")
            const filenameParts = name.replace('.pdf', '').split('_');
            const extractedName = filenameParts.slice(0, -1).join(' ');
            const extractedId = filenameParts[filenameParts.length - 1];

            // Generate random values for required fields
            const randomValues = generateRandomValues(extractedName, extractedId);

            // Add required fields with random values
            const candidateData = {
              name: extractedName,
              ...randomValues,
              semester,
              assignmentStatus: false,
              ...resumeData  // This will override defaults if values exist in resumeData
            };
            
            try {
              await CandidatesService.addCandidate(candidateData);
              console.log('Successfully saved to database:', name);
              processedCount++;
            } catch (error) {
              console.error('Error saving to database:', error);
              errors.push({ filename: name, error: 'Failed to save to database: ' + error.message });
              continue;
            }

            console.log('Successfully processed:', name);
          } catch (error) {
            console.error('Error parsing resume:', error);
            errors.push({ filename: name, error: 'Failed to parse resume: ' + error.message });
            continue;
          }
        } catch (error) {
          const errorMessage = `Error processing ${name}: ${error.message}`;
          console.error(errorMessage);
          errors.push({ filename: name, error: error.message });
        }
      } else {
        console.log('Skipping non-PDF file:', name);
      }
    }

    console.log('Processing complete. Stats:', {
      processedCount,
      totalFiles: files.length,
      pdfFiles: files.filter(f => f.name.toLowerCase().endsWith('.pdf')).length,
      errors: errors.length,
      errorDetails: errors
    });

    if (processedCount === 0) {
      return res.json({
        message: 'No resumes were processed. Please check that your ZIP file contains PDF files.',
        processedCount: 0,
        totalFiles: files.length,
        filesFound: files.map(f => f.name),
        errors: errors.length > 0 ? errors : undefined
      });
    }

    res.json({ 
      message: `Successfully processed ${processedCount} resumes`,
      processedCount,
      totalFiles: files.length,
      filesFound: files.map(f => f.name),
      errors: errors.length > 0 ? errors : undefined
    });
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