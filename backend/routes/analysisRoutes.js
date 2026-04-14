import express from 'express';
import { analyzeAndSaveCode, getUserHistory } from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Protected. Accepts either:
 *   - multipart/form-data with a "codeFile" file field, OR
 *   - application/json with a "code" string field
 */
router.post(
  '/',
  protect,
  upload.single('codeFile'), // multer runs first; sets req.file if a file was uploaded
  analyzeAndSaveCode
);

/**
 * GET /api/analyze/history
 * Protected. Returns the logged-in user's code history with file contents.
 */
router.get('/history', protect, getUserHistory);

export default router;
