import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRoutes.js';
import aiRoutes from '../routes/aiRoutes.js';

// Minimal app for testing — no DB connect, no rate limit, no helmet
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/ai', aiRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
  });

  return app;
};

export default createTestApp;
