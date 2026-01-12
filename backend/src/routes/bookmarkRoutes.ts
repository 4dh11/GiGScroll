import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  addBookmark, 
  removeBookmark, 
  getMyBookmarks 
} from '../controllers/bookmarkController';

const router = Router();

// Get all bookmarks for the logged-in user
router.get('/', requireAuth, getMyBookmarks);

// Add a bookmark (ID comes from URL param now, cleaner than body)
router.post('/:jobId', requireAuth, addBookmark);

// Remove a bookmark
router.delete('/:jobId', requireAuth, removeBookmark);

export default router;