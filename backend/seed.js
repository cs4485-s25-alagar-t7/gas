// This file adds some example data to the database. Can be run from outside any docker container
import { connect } from 'mongoose';
import Assignment from './models/Assignment.js';
import { configDotenv } from 'dotenv';
import Section from './models/Section.js';
import Candidate from './models/Candidate.js';
configDotenv({ "path": "../.env" });

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
    console.log('🧹 Cleared Sections');
    return Candidate.deleteMany({});
  }
  ).then(() => {
    console.log('🧹 Cleared Candidates');
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
