import CodeHistory from '../models/CodeHistory.js';
import { analyzeCode } from '../services/analysisService.js';
import { saveCodeFile, readCodeFile } from '../services/fileService.js';

/**
 * POST /api/analyze
 *
 * Accepts code in one of two ways:
 *  1. File upload  — multipart/form-data with field name "codeFile"
 *  2. JSON body    — { "code": "..." }
 *
 * Analyzes the code, saves original + refined to .txt files,
 * and records the file paths in MongoDB.
 */
export const analyzeAndSaveCode = async (req, res, next) => {
  try {
    let code;

    // ── Priority 1: uploaded file ─────────────────────────────────────────
    if (req.file) {
      code = req.file.buffer.toString('utf8');
    }
    // ── Priority 2: JSON body string ──────────────────────────────────────
    else if (req.body && typeof req.body.code === 'string') {
      code = req.body.code;
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        message: 'Please provide code either as a file upload (field: codeFile) or as a JSON body { "code": "..." }.',
      });
    }

    const userId = req.user._id;

    // 1. Perform static analysis
    const analysisResult = analyzeCode(code);

    // 2. Save original and refined code to .txt files in parallel
    const [originalFilePath, refinedFilePath] = await Promise.all([
      saveCodeFile(userId, 'original', code),
      saveCodeFile(userId, 'refined', analysisResult.refactoredCode),
    ]);

    // 3. Persist metadata + file paths to MongoDB
    const historyEntry = await CodeHistory.create({
      user: userId,
      originalFilePath,
      refinedFilePath,
      issuesFound:
        analysisResult.criticalIssues.length + analysisResult.security.issues.length,
      score: analysisResult.score,
    });

    // 4. Return the full analysis result with the history record ID
    return res.status(200).json({
      ...analysisResult,
      historyId: historyEntry._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analyze/history
 * Returns the authenticated user's full code history,
 * reading code content back from the filesystem.
 */
export const getUserHistory = async (req, res, next) => {
  try {
    const history = await CodeHistory.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    // Read file contents for each entry in parallel
    const historyWithCode = await Promise.all(
      history.map(async (entry) => {
        const [originalCode, refinedCode] = await Promise.all([
          readCodeFile(entry.originalFilePath),
          readCodeFile(entry.refinedFilePath),
        ]);

        return {
          _id: entry._id,
          score: entry.score,
          issuesFound: entry.issuesFound,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          originalCode,
          refinedCode,
        };
      })
    );

    return res.status(200).json(historyWithCode);
  } catch (error) {
    next(error);
  }
};
