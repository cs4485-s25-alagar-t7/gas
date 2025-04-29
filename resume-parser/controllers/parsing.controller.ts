import { Request, Response } from 'express';
import Router from 'express';
import { parseResume } from '../services/parsing.service.js';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { Resume } from 'lib/redux/types.js';

// create a multer instance to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

// endpoint to parse resumes. Expects a multipart/form-data request with a zip file of pdfs
// unzips the file and parses each pdf file in the zip file
// then saves the parsed resume data to the database
// returns a status code 200 if successful
router.post('/parse-resumes', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const zipBuffer = req.file.buffer;
        const zip = new AdmZip(zipBuffer);
        if (!zip) {
            res.status(400).json({ error: 'Invalid zip file' });
            return;
        }
        const parsedResumes = [];

        for (const file of zip.getEntries()) {
            if (file.entryName.endsWith('.pdf')) {
                const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                    file.getDataAsync((data, err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
                if (!pdfBuffer) {
                    res.status(400).json({ error: 'Invalid pdf file' });
                    return;
                }
                const parsedData = await parseResume(pdfBuffer);
                // TODO: save parsedData to database
                // await saveResumeInfoToDB(parsedData);
                parsedResumes.push(parsedData);
            }
        }

        res.status(200).json({ message: 'Resumes parsed and saved successfully', data: parsedResumes });
    } catch (error) {
        console.error('Error parsing resumes:', error);
        res.status(500).json({ error: 'Failed to parse resumes' });
    }
});

export default router;