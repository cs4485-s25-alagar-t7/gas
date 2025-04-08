const mongoose = require('mongoose');
const Assignment = require('./services/models/Assignments');

mongoose.connect('mongodb://mongo:27017/gas')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return Assignment.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared assignments');
    return Assignment.insertMany([
      {
        courseNumber: 'CS2340',
        professorName: 'John Cole',
        candidateID: '12345'
      },
      {
        courseNumber: 'CS4349',
        professorName: 'Serdar Erbatur',
        candidateID: '67890'
      }
    ]);
  })
  .then(() => {
    console.log('✅ Sample data seeded!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
