import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateStatus,
  assignComplaint,
  deleteComplaint,
} from '../controllers/complaintController.js';

const router = express.Router();

// POST /api/complaints
// Any logged in user can submit a complaint
// upload.array('attachments', 5) means:
// accept files from field named 'attachments', max 5 files
router.post(
  '/',
  protect,
  upload.array('attachments', 5),
  createComplaint
);

// GET /api/complaints
// Users see their own, staff see assigned, admin sees all
router.get('/', protect, getComplaints);

// GET /api/complaints/:id
// Get one specific complaint
router.get('/:id', protect, getComplaint);

// PATCH /api/complaints/:id/status
// Only staff and admin can update status
router.patch(
  '/:id/status',
  protect,
  authorize('staff', 'admin'),
  updateStatus
);

// PATCH /api/complaints/:id/assign
// Only admin can assign complaints to staff
router.patch(
  '/:id/assign',
  protect,
  authorize('admin'),
  assignComplaint
);

// DELETE /api/complaints/:id
// Owner (if Open) or admin can delete
router.delete('/:id', protect, deleteComplaint);

export default router;
