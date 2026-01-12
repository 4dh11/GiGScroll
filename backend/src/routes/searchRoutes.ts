import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { searchJobs, searchUsers } from '../controllers/searchController';

const router = Router();

router.get('/jobs', requireAuth, searchJobs);
router.get('/users', requireAuth, searchUsers);

export default router;
