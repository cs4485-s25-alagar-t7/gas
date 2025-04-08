require('dotenv').config();
const express = require('express');
const cors = require('cors');
const assignmentsRouter = require('./controllers/assignments.controller');
const mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/gas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
    console.log('✅ Connected to MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
const app = express();
app.use(cors());
app.use(express.json());

// Add this:
app.use('/api/assignments', assignmentsRouter);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
