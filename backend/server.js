import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import 'express-async-errors';

import connectDB from './config/db.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// 1. Connect to MongoDB
connectDB();

// 2. Set up Google OAuth strategy
configurePassport();

const app = express();

// 3. Middlewares — run on EVERY request
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// 4. Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);

// 5. Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ ComplaintSys API is running!' });
});

// 6. Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});