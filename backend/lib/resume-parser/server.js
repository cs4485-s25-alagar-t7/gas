import { config } from 'dotenv';
config();
import express from 'express';
import { json } from 'express';
import cors from 'cors';
import parsingRouter from './controllers/parsing.controller.js';
var app = express();
app.use(cors());
app.use(json());
var PORT = process.env.PORT || 5001;
app.get('/api', function (req, res) {
    res.send('Backend is running!');
});
app.use('/api/resumes', parsingRouter);
app.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
