// This file adds some example data to the database. Can be run from outside any docker container
import {connect} from 'mongoose';
import Assignment from './models/Assignment.js';
import { configDotenv } from 'dotenv';
import Course from './models/Course.js';
import Candidate from './models/Candidate.js';
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
    return Course.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared courses');
    return Candidate.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared candidates');
    return Course.insertMany([
      {
        course_id: 'CS2340',
        section_id: '501',
        instructor: { name: 'Dr. Smith', email: 'smith@example.edu' },
        keywords: ['software', 'design'],
        semester: 'fall2025',
        num_required_graders: 1
      },
      {
        course_id: 'CS1331',
        section_id: '002',
        instructor: { name: 'Dr. Johnson', email: 'johnson@example.edu' },
        keywords: ['java', 'programming'],
        semester: 'fall2025',
        num_required_graders: 3
      }
    ]);
  })
  .then(() => {
    console.log('✅ Courses seeded!');
    return Candidate.insertMany([
      {
        name: 'Alice Johnson',
        netid: 'axj220000',
        gpa: 3.8,
        major: 'Computer Science',
        minor: 'Mathematics',
        classes: ['CS2340', 'CS1331'],
        previous_grader_experience: true,
        seniority: 'Masters',
        resume_keywords: ['software', 'design', 'java'],
        semester: 'fall2025',
      },
      {
        name: 'Bob Smith',
        netid: 'bjs1234400',
        gpa: 3.5,
        major: 'Computer Engineering',
        classes: ['CS2340'],
        previous_grader_experience: false,
        seniority: 'Undergraduate',
        resume_keywords: ['hardware', 'design'],
        semester: 'fall2025',
      }
    ]);
  })
  .then(() => {
    console.log('✅ Candidates seeded!');
    return Promise.all([
      Candidate.findOne({ netid: 'axj220000' }).exec(),
      Candidate.findOne({ netid: 'bjs1234400' }).exec(),
      Course.findOne({ course_id: 'CS1331', section_id: '002' }).exec(),
      Course.findOne({ course_id: 'CS2340', section_id: '501' }).exec()
    ]).then(([alice, bob, cs1331, cs2340]) => {
      if (!alice || !bob || !cs1331 || !cs2340) {
      throw new Error('Failed to fetch required data for assignments');
      }
      return Assignment.insertMany([
      {
        course_section_id: cs1331._id,
        grader_id: alice._id,
        semester: 'fall2025'
      },
      {
        course_section_id: cs2340._id,
        grader_id: bob._id,
        semester: 'fall2025'
      }
      ]);
    });
  })
  .then(() => {
    console.log('✅ Assignments seeded!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
