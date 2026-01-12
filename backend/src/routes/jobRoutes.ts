import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listJobs,
  getNextJob,
  swipeRightOnJob,
  swipeLeftOnJob,
  getJobMatchScore,
  recoverRejectedJobs
} from '../controllers/jobController';

const router = Router();

router.get('/', requireAuth, listJobs);
router.get('/next', requireAuth, getNextJob);
router.get('/:jobId/match-score', requireAuth, getJobMatchScore);
router.post('/:jobId/swipe-right', requireAuth, swipeRightOnJob);
router.post('/:jobId/swipe-left', requireAuth, swipeLeftOnJob);
router.post('/recover', requireAuth, recoverRejectedJobs);


export default router;
