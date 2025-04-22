// This file adds some example data to the database. Can be run from outside any docker container
import {connect} from 'mongoose';
import Assignment from './models/Assignment.js';
import { configDotenv } from 'dotenv';
import Section from './models/Section.js';
import Candidate from './models/Candidate.js';
configDotenv({"path" : "../.env"});

const admin = process.env.MONGO_INITDB_ROOT_USERNAME;
const pw = process.env.MONGO_INITDB_ROOT_PASSWORD;
const authSource = process.env.MONGO_DB_AUTH_SOURCE;

connect(`mongodb://${admin}:${pw}@mongo:27017/gas?authSource=${authSource}`)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    return Assignment.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared assignments');
    return Section.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared sections');
    return Candidate.deleteMany({});
  })
  .then(() => {
    console.log('🧹 Cleared candidates');
    return Section.insertMany([
      {
        course_name: "CS 1337",
        section_num: "001",
        instructor: {
          name: "John Smith",
          netid: "jxs123456"
        },
        keywords: ["C++", "programming", "data structures"],
        semester: "spring 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 1337",
        section_num: "002",
        instructor: {
          name: "Sarah Johnson",
          netid: "sxj789012"
        },
        keywords: ["C++", "programming", "algorithms"],
        semester: "spring 2024",
        num_required_graders: 1
      },
      {
        course_name: "CS 2336",
        section_num: "001",
        instructor: {
          name: "Michael Brown",
          netid: "mxb345678"
        },
        keywords: ["C++", "advanced programming", "object oriented"],
        semester: "spring 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3345",
        section_num: "001",
        instructor: {
          name: "Emily Davis",
          netid: "exd901234"
        },
        keywords: ["algorithms", "data structures", "Java"],
        semester: "spring 2024",
        num_required_graders: 1
      },
      {
        course_name: "CS 4349",
        section_num: "001",
        instructor: {
          name: "Robert Wilson",
          netid: "rxw567890"
        },
        keywords: ["advanced algorithms", "dynamic programming"],
        semester: "spring 2024",
        num_required_graders: 1
      }
    ]);
  })
  .then(() => {
    console.log('✅ Sections seeded!');
    return Candidate.insertMany([
      // Returning TAs with high qualifications
      {
        name: "Alice Chen",
        netid: "axc123456",
        gpa: 3.9,
        major: "Computer Science",
        minor: "Mathematics",
        classes: ["CS 1337", "CS 2336"],
        previous_grader_experience: true,
        seniority: "Masters",
        resume_keywords: ["C++", "Java", "Python", "data structures"],
        semester: "spring 2024"
      },
      {
        name: "Bob Martinez",
        netid: "bxm789012",
        gpa: 3.8,
        major: "Computer Science",
        minor: null,
        classes: ["CS 3345"],
        previous_grader_experience: true,
        seniority: "PhD",
        resume_keywords: ["algorithms", "data structures", "C++"],
        semester: "spring 2024"
      },
      // New candidates with strong qualifications
      {
        name: "Carol Wong",
        netid: "cxw345678",
        gpa: 3.95,
        major: "Computer Science",
        minor: null,
        classes: ["CS 1337", "CS 2336", "CS 3345"],
        previous_grader_experience: false,
        seniority: "Masters",
        resume_keywords: ["C++", "Java", "algorithms"],
        semester: "spring 2024"
      },
      {
        name: "David Kim",
        netid: "dxk901234",
        gpa: 3.7,
        major: "Software Engineering",
        minor: "Mathematics",
        classes: ["CS 1337", "CS 2336"],
        previous_grader_experience: false,
        seniority: "Undergraduate",
        resume_keywords: ["C++", "object oriented programming"],
        semester: "spring 2024"
      },
      // Candidates with moderate qualifications
      {
        name: "Eva Garcia",
        netid: "exg567890",
        gpa: 3.4,
        major: "Computer Science",
        minor: null,
        classes: ["CS 1337"],
        previous_grader_experience: false,
        seniority: "Undergraduate",
        resume_keywords: ["Python", "C++", "programming"],
        semester: "spring 2024"
      },
      {
        name: "Frank Lee",
        netid: "fxl234567",
        gpa: 3.3,
        major: "Computer Science",
        minor: null,
        classes: ["CS 1337", "CS 2336"],
        previous_grader_experience: false,
        seniority: "Undergraduate",
        resume_keywords: ["Java", "algorithms"],
        semester: "spring 2024"
      },
      // Candidates with lower qualifications
      {
        name: "Grace Taylor",
        netid: "gxt890123",
        gpa: 3.1,
        major: "Computer Science",
        minor: null,
        classes: ["CS 1337"],
        previous_grader_experience: false,
        seniority: "Undergraduate",
        resume_keywords: ["C++", "programming"],
        semester: "spring 2024"
      },
      {
        name: "Henry Wilson",
        netid: "hxw456789",
        gpa: 3.0,
        major: "Computer Science",
        minor: null,
        classes: ["CS 1337"],
        previous_grader_experience: false,
        seniority: "Undergraduate",
        resume_keywords: ["Python", "basic algorithms"],
        semester: "spring 2024"
      }
    ]);
  })
  .then(() => {
    console.log('✅ Candidates seeded!');
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
