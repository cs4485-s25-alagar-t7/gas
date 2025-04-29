import { createSection } from "../services/sections.service";
import { Router } from "express";
import multer from "multer";
import * as XLSX from 'xlsx/xlsx.mjs';


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('sectionsSheet'), async (req, res) => {
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
    }

    catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Failed to process file', error: error.message });
    }

    // parse the excel file
    const sections = [];
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headers = data[0];
    const semester = req.body.semester;

    // read each row and create a section object
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const section = {};
        for (let j = 0; j < headers.length; j++) {
            section[headers[j]] = row[j];
        }
        section.semester = semester;
        sections.push(section);
    }
    if (sections.length === 0) {
        return res.status(400).json({ message: 'No valid sections found in the file' });
    }

    // map the sections to the required format
    const formatted_sections = sections.map(section => {
        return {
            course_name: section['Course Number'],
            section_num: section['Section'],
            instructor: {
                name: section['Professor Name'],
                netid: section['Professor Email'].split('@')[0]
            },
            keywords: section['Keywords'] ? section['Keywords'].split(',').map(keyword => keyword.trim()) : [],
            semester: semester,
            num_required_graders: parseInt(section['Num of graders']),
            requested_candidate_UTDIDs: section['Requested Candidate UTDIDs'] ? section['Requested Candidate UTDIDs'].split(',').map(utdid => utdid.trim()) : []
        };
    }
    );

    // print the first section to the console
    console.log('First section parsed:', formatted_sections[0]);

    // create sections in the database
    const createdSections = await Promise.all(sections.map(createSection));
    res.status(201).json(createdSections);
});


export default router;