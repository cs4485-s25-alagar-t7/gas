import { config } from 'dotenv';
config();
import express from 'express';
import { json } from 'express';
import cors from 'cors';
import { parseResumeFromPdf } from './lib/parse-resume-from-pdf/index.js';

const app = express();
app.use(cors());
app.use(json());

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.post('api/resume', (req, res) => {
    const resume = parseResumeFromPdf(req.body);

    
    res.send('Resume parsing endpoint');

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});