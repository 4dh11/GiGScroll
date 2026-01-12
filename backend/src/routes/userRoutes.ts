import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadResume, getProfile, updateProfile } from '../controllers/userController';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.doc' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/upload-resume', requireAuth, upload.single('resume'), uploadResume);
router.get('/profile', requireAuth, getProfile);
router.patch('/profile', requireAuth, updateProfile);

export default router;
