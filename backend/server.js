import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import assignmentsRouter from './controllers/assignments.controller.js';
import candidatesRouter from './controllers/candidates.controller.js';
import professorsRouter from './controllers/professors.controller.js';
import adminRoutes from './routes/admin.routes.js';

const username = process.env.MONGO_INITDB_ROOT_USERNAME;
const pw = process.env.MONGO_INITDB_ROOT_PASSWORD;

mongoose.connect(`mongodb://${username}:${pw}@mongo:27017/gas?authSource=${process.env.MONGO_DB_AUTH_SOURCE}`, {
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
app.use(json());

// Routers
app.use('/api/assignments', assignmentsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/professors', professorsRouter);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Backend running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
