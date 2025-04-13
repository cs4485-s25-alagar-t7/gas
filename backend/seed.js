// seed.js
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
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      Candidate.deleteMany({}),
      Course.deleteMany({}),
      Assignment.deleteMany({})
    ]);
    console.log('🧹 Cleared Candidates, Courses, and Assignments');

    const [johnDoe, chonDo, thenMalli, donJoe, jonJoe] = await Candidate.insertMany([
      {
        name: "John Doe",
        netid: "jxd210000",
        gpa: 3.9,
        major: "Computer Science",
        minor: "",
        classes: ["CS1336"],
        previous_grader_experience: true,
        seniority: "Masters",
        resume_keywords: ["algorithms", "data structures"],
        semester: "Spring 2025"
      },
      {
        name: "Chon Do",
        netid: "cdo210000",
        gpa: 3.6,
        major: "Software Engineering",
        minor: "",
        classes: ["CS4348", "CS4384"],
        previous_grader_experience: false,
        seniority: "Undergraduate",
        resume_keywords: ["systems", "architecture"],
        semester: "Spring 2025"
      },
      {
        name: "Then Malligarjun",
        netid: "tml210000",
        gpa: 3.7,
        major: "Computer Engineering",
        minor: "",
        classes: ["CS4348", "CS4384"],
        previous_grader_experience: true,
        seniority: "PhD",
        resume_keywords: ["operating systems"],
        semester: "Spring 2025"
      },
      {
        name: "Don Joe",
        netid: "djo210000",
        gpa: 3.5,
        major: "Computer Science",
        minor: "Math",
        classes: ["CS3345", "CS4341"],
        previous_grader_experience: false,
        seniority: "Masters",
        resume_keywords: ["algorithms"],
        semester: "Spring 2025"
      },
      {
        name: "Jon Joe",
        netid: "jjo210000",
        gpa: 3.8,
        major: "CS",
        minor: "",
        classes: ["CS3345", "CS4341"],
        previous_grader_experience: true,
        seniority: "PhD",
        resume_keywords: ["algorithms", "math"],
        semester: "Spring 2025"
      }
    ]);

    const [course1, course2, course3, course4, course5] = await Course.insertMany([
      {
        course_id: "CS1336",
        section_id: "001",
        instructor: { name: "Sridhar Alagar", email: "sridhar@utd.edu" },
        keywords: ["intro", "programming"],
        semester: "Spring 2025",
        num_required_graders: 1
      },
      {
        course_id: "CS4348",
        section_id: "501",
        instructor: { name: "Eric Becker", email: "becker@utd.edu" },
        keywords: ["os", "memory"],
        semester: "Spring 2025",
        num_required_graders: 1
      },
      {
        course_id: "CS3345",
        section_id: "500",
        instructor: { name: "John Cole", email: "cole@utd.edu" },
        keywords: ["data structures", "algorithms"],
        semester: "Spring 2025",
        num_required_graders: 1
      },
      {
        course_id: "CS4341",
        section_id: "123",
        instructor: { name: "Neeraj Gupta", email: "gupta@utd.edu" },
        keywords: ["digital", "logic"],
        semester: "Spring 2025",
        num_required_graders: 1
      },
      {
        course_id: "CS4384",
        section_id: "502",
        instructor: { name: "Emily Fox", email: "fox@utd.edu" },
        keywords: ["automata", "theory"],
        semester: "Spring 2025",
        num_required_graders: 1
      }
    ]);

    await Assignment.insertMany([
      {
        grader_id: johnDoe._id,
        course_section_id: course1._id,
        status: "accepted",
        semester: "Spring 2025",
        score: 4.8,
        manuallyAssigned: true
      },
      {
        grader_id: chonDo._id,
        course_section_id: course2._id,
        status: "accepted",
        semester: "Spring 2025",
        score: 3.9,
        manuallyAssigned: true
      },
      {
        grader_id: donJoe._id,
        course_section_id: course3._id,
        status: "accepted",
        semester: "Spring 2025",
        score: 4.1,
        manuallyAssigned: true
      },
      {
        grader_id: thenMalli._id,
        course_section_id: course5._id,
        status: "accepted",
        semester: "Spring 2025",
        score: 4.6,
        manuallyAssigned: true
      }
    ]);

    console.log("✅ Sample professor-related data seeded!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
