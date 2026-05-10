import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { analyzeComplaint } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/analyze
// Token stays server-side — never exposed in the client bundle
router.post('/analyze', protect, analyzeComplaint);

export default router;
