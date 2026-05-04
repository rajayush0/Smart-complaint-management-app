import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addComment,
  getComments,
  deleteComment,
} from '../controllers/commentController.js';

// mergeParams: true is IMPORTANT
// It allows us to access :id from the parent route
// Because comments are nested under complaints:
// /api/complaints/:id/comments
const router = express.Router({ mergeParams: true });

// POST /api/complaints/:id/comments
router.post('/', protect, addComment);

// GET /api/complaints/:id/comments
router.get('/', protect, getComments);

// DELETE /api/complaints/:id/comments/:commentId
router.delete('/:commentId', protect, deleteComment);

export default router;