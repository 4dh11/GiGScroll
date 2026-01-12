import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  getUserApplications, 
  updateApplicationStatus 
} from '../controllers/applicationController';

const router = Router();

// Get my applications (optional ?status=ACCEPTED)
router.get('/mine', requireAuth, getUserApplications);

// Update status (e.g. for testing or recruiter view)
router.patch('/:applicationId/status', requireAuth, updateApplicationStatus);

export default router;