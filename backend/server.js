require('dotenv').config();
const express = require('express');
const cors = require('cors');
const assignmentsController = require('./controllers/assignments.controller');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/assignments', assignmentsController.getAllAssignments);


const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});