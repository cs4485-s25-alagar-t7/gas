// This file adds some example data to the database. Can be run from outside any Docker container
import { connect } from 'mongoose';
import { configDotenv } from 'dotenv';
import Candidate from './models/Candidate.js';
import Course from './models/Course.js';
import Assignment from './models/Assignment.js';

configDotenv({ path: '../.env' });

const admin = process.env.MONGO_INITDB_ROOT_USERNAME;
const pw = process.env.MONGO_INITDB_ROOT_PASSWORD;
const authSource = process.env.MONGO_DB_AUTH_SOURCE;

connect(`mongodb://${admin}:${pw}@mongo:27017/gas?authSource=${authSource}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return Promise.all([
      Candidate.deleteMany({}),
      Course.deleteMany({}),
      Assignment.deleteMany({})
    ]);
  })
  .then(() => {
    console.log('🧹 Cleared Candidates, Courses, and Assignments');

    const candidate1 = new Candidate({
      name: "John Doe",
      netid: "jxd210000",
      gpa: 3.8,
      major: "Computer Science",
      minor: "Mathematics",
      classes: ["CS1337", "CS2305"],
      previous_grader_experience: true,
      seniority: "Masters",
      resume_keywords: ["algorithms", "data structures", "teaching"],
      semester: "Spring 2025",
      unassigned: false
    });
    
    const candidate2 = new Candidate({
      name: "Jane Smith",
      netid: "jxs210000",
      gpa: 3.6,
      major: "Software Engineering",
      minor: "",
      classes: ["CS2340", "CS2336"],
      previous_grader_experience: false,
      seniority: "Undergraduate",
      resume_keywords: ["systems", "debugging", "c++"],
      semester: "Spring 2025",
      unassigned: false
    });
    const course1 = new Course({
      course_id: "CS1337",
      section_id: "001",
      instructor: {
        name: "Sridhar Alagar",
        email: "sxa123456@utdallas.edu"
      },
      keywords: ["algorithms", "data structures"],
      semester: "Spring 2025",
      num_required_graders: 1
    });

    const course2 = new Course({
      course_id: "CS2340",
      section_id: "005",
      instructor: {
        name: "John Cole",
        email: "jxc123456@utdallas.edu"
      },
      keywords: ["computer architecture", "systems"],
      semester: "Spring 2025",
      num_required_graders: 1
    });

    return Promise.all([
      candidate1.save(),
      candidate2.save(),
      course1.save(),
      course2.save()
    ]);
  })
  .then(([savedCandidate1, savedCandidate2, savedCourse1, savedCourse2]) => {
    console.log('📦 Saved Candidates and Courses');

    const assignment1 = new Assignment({
      grader_id: savedCandidate1._id,
      course_section_id: savedCourse1._id,
      status: "accepted",
      semester: "Spring 2025",
      score: 4.5,
      manuallyAssigned: true
    });

    const assignment2 = new Assignment({
      grader_id: savedCandidate2._id,
      course_section_id: savedCourse2._id,
      status: "accepted",
      semester: "Spring 2025",
      score: 3.7,
      manuallyAssigned: false
    });

    return Assignment.insertMany([assignment1, assignment2]);
  })
  .then(() => {
    console.log('✅ Sample data seeded!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
