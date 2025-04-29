import { config } from 'dotenv';
config();
import express from 'express';
import { json } from 'express';
import cors from 'cors';
import parsingRouter from './controllers/parsing.controller.js';


const app = express();
app.use(cors());
app.use(json());

const PORT = process.env.PORT || 5001;

app.get('/api', (req, res) => {
    res.send('Backend is running!');
});

app.use('/api/resumes', parsingRouter);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});