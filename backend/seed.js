import {connect} from 'mongoose';
import Assignment from './services/models/Assignments.js';
import { configDotenv } from 'dotenv';
configDotenv({"path" : "../.env"});

const admin = process.env.MONGO_INITDB_ROOT_USERNAME;
const pw = process.env.MONGO_INITDB_ROOT_PASSWORD;
connect(`mongodb://${admin}:${pw}@localhost:27017/gas?authSource=${process.env.MONGO_DB_AUTH_SOURCE}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return Assignment.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared assignments');
    return Assignment.insertMany([
      {
        courseId: 'CS2340',
        professorId: '23456',
        candidateId: '12345',
        isReturning: false
      },
      {
        courseId: 'CS4349',
        professorId: '34567',
        candidateId: '67890',
        isReturning: false
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
