import { bulkCreateSectionsFromExcel } from "../services/sections.service.js";
import { Router } from "express";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('sectionsSheet'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { semester } = req.body;
        if (!semester) {
            return res.status(400).json({ message: 'Semester is required' });
        }

        const createdSections = await bulkCreateSectionsFromExcel(req.file.buffer, semester);
        res.status(201).json(createdSections);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Failed to process file', error: error.message });
    }
});

export default router;