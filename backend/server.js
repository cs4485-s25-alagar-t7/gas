import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import assignmentsRouter from './controllers/assignments.controller.js';
import candidatesRouter from './controllers/candidates.controller.js';
import professorsRouter from './controllers/professors.controller.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// MongoDB Connection
const admin = process.env.MONGO_INITDB_ROOT_USERNAME;
const pw = process.env.MONGO_INITDB_ROOT_PASSWORD;
const authSource = process.env.MONGO_DB_AUTH_SOURCE || 'admin';

mongoose.connect(`mongodb://${admin}:${pw}@mongo:27017/gas?authSource=${authSource}`)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Basic middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Add response headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Session setup with basic configuration
app.use(session({
  name: 'sessionId',
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/professors', professorsRouter);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
