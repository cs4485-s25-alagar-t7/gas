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
    return Section.insertMany([
      // Fall 2024 Sections
      {
        course_name: "CS 1337",
        section_num: "001",
        instructor: { name: "John Smith", netid: "jxs123456" },
        keywords: ["C++", "programming", "data structures"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 1337",
        section_num: "002",
        instructor: { name: "Sarah Johnson", netid: "sxj789012" },
        keywords: ["C++", "programming", "algorithms"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 1337",
        section_num: "003",
        instructor: { name: "Michael Brown", netid: "mxb345678" },
        keywords: ["C++", "programming", "data structures"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 2336",
        section_num: "001",
        instructor: { name: "Emily Davis", netid: "exd901234" },
        keywords: ["C++", "advanced programming", "object oriented"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 2336",
        section_num: "002",
        instructor: { name: "Robert Wilson", netid: "rxw567890" },
        keywords: ["C++", "advanced programming", "object oriented"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3345",
        section_num: "001",
        instructor: { name: "David Lee", netid: "dxl123456" },
        keywords: ["algorithms", "data structures", "Java"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3345",
        section_num: "002",
        instructor: { name: "Jennifer Kim", netid: "jxk789012" },
        keywords: ["algorithms", "data structures", "Java"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3354",
        section_num: "001",
        instructor: { name: "Thomas Anderson", netid: "txa345678" },
        keywords: ["software engineering", "Java", "design patterns"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3354",
        section_num: "002",
        instructor: { name: "Lisa Chen", netid: "lxc901234" },
        keywords: ["software engineering", "Java", "design patterns"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3377",
        section_num: "001",
        instructor: { name: "William Taylor", netid: "wxt567890" },
        keywords: ["C", "systems programming", "Unix"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 3377",
        section_num: "002",
        instructor: { name: "Patricia Moore", netid: "pxm123456" },
        keywords: ["C", "systems programming", "Unix"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4337",
        section_num: "001",
        instructor: { name: "James White", netid: "jxw789012" },
        keywords: ["Python", "web development", "databases"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4337",
        section_num: "002",
        instructor: { name: "Maria Garcia", netid: "mxg345678" },
        keywords: ["Python", "web development", "databases"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4347",
        section_num: "001",
        instructor: { name: "Charles Martin", netid: "cxm901234" },
        keywords: ["database systems", "SQL", "NoSQL"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4347",
        section_num: "002",
        instructor: { name: "Susan Clark", netid: "sxc567890" },
        keywords: ["database systems", "SQL", "NoSQL"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4348",
        section_num: "001",
        instructor: { name: "Daniel Young", netid: "dxy123456" },
        keywords: ["operating systems", "C", "Linux"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4348",
        section_num: "002",
        instructor: { name: "Nancy Hall", netid: "nxh789012" },
        keywords: ["operating systems", "C", "Linux"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4349",
        section_num: "001",
        instructor: { name: "Mark Allen", netid: "mxa345678" },
        keywords: ["advanced algorithms", "dynamic programming"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4352",
        section_num: "001",
        instructor: { name: "Karen Scott", netid: "kxs901234" },
        keywords: ["computer networks", "TCP/IP", "security"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      {
        course_name: "CS 4352",
        section_num: "002",
        instructor: { name: "Paul King", netid: "pxk567890" },
        keywords: ["computer networks", "TCP/IP", "security"],
        semester: "Fall 2024",
        num_required_graders: 2
      },
      // Spring 2025 Sections
      {
        course_name: "CS 1337",
        section_num: "001",
        instructor: { name: "John Smith", netid: "jxs123456" },
        keywords: ["C++", "programming", "data structures"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 1337",
        section_num: "002",
        instructor: { name: "Sarah Johnson", netid: "sxj789012" },
        keywords: ["C++", "programming", "algorithms"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 1337",
        section_num: "003",
        instructor: { name: "Michael Brown", netid: "mxb345678" },
        keywords: ["C++", "programming", "data structures"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 2336",
        section_num: "001",
        instructor: { name: "Emily Davis", netid: "exd901234" },
        keywords: ["C++", "advanced programming", "object oriented"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 2336",
        section_num: "002",
        instructor: { name: "Robert Wilson", netid: "rxw567890" },
        keywords: ["C++", "advanced programming", "object oriented"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 3345",
        section_num: "001",
        instructor: { name: "David Lee", netid: "dxl123456" },
        keywords: ["algorithms", "data structures", "Java"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 3345",
        section_num: "002",
        instructor: { name: "Jennifer Kim", netid: "jxk789012" },
        keywords: ["algorithms", "data structures", "Java"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 3354",
        section_num: "001",
        instructor: { name: "Thomas Anderson", netid: "txa345678" },
        keywords: ["software engineering", "Java", "design patterns"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 3354",
        section_num: "002",
        instructor: { name: "Lisa Chen", netid: "lxc901234" },
        keywords: ["software engineering", "Java", "design patterns"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 3377",
        section_num: "001",
        instructor: { name: "William Taylor", netid: "wxt567890" },
        keywords: ["C", "systems programming", "Unix"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 3377",
        section_num: "002",
        instructor: { name: "Patricia Moore", netid: "pxm123456" },
        keywords: ["C", "systems programming", "Unix"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4337",
        section_num: "001",
        instructor: { name: "James White", netid: "jxw789012" },
        keywords: ["Python", "web development", "databases"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4337",
        section_num: "002",
        instructor: { name: "Maria Garcia", netid: "mxg345678" },
        keywords: ["Python", "web development", "databases"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4347",
        section_num: "001",
        instructor: { name: "Charles Martin", netid: "cxm901234" },
        keywords: ["database systems", "SQL", "NoSQL"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4347",
        section_num: "002",
        instructor: { name: "Susan Clark", netid: "sxc567890" },
        keywords: ["database systems", "SQL", "NoSQL"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4348",
        section_num: "001",
        instructor: { name: "Daniel Young", netid: "dxy123456" },
        keywords: ["operating systems", "C", "Linux"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4348",
        section_num: "002",
        instructor: { name: "Nancy Hall", netid: "nxh789012" },
        keywords: ["operating systems", "C", "Linux"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4349",
        section_num: "001",
        instructor: { name: "Mark Allen", netid: "mxa345678" },
        keywords: ["advanced algorithms", "dynamic programming"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4352",
        section_num: "001",
        instructor: { name: "Karen Scott", netid: "kxs901234" },
        keywords: ["computer networks", "TCP/IP", "security"],
        semester: "Spring 2025",
        num_required_graders: 2
      },
      {
        course_name: "CS 4352",
        section_num: "002",
        instructor: { name: "Paul King", netid: "pxk567890" },
        keywords: ["computer networks", "TCP/IP", "security"],
        semester: "Spring 2025",
        num_required_graders: 2
      }
    ]);
  })
  .then(() => {
    console.log('✅ Sections seeded!');
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
