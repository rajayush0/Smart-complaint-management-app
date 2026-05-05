import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createOrganization,
  joinOrganization,
  getMyOrganizations,
  getOrganization,
  validateInviteCode,
  regenerateCode,
} from '../controllers/organizationController.js';

const router = express.Router();

// All org routes require authentication
router.use(protect);

router.post('/',              createOrganization);   // Create new org
router.post('/join',          joinOrganization);     // Join via invite code
router.get('/mine',           getMyOrganizations);   // My orgs list
router.get('/validate/:code', validateInviteCode);   // Check if code is valid
router.get('/:id',            getOrganization);      // Org details
router.post('/:id/regenerate-code', regenerateCode); // Regenerate invite code

export default router;
