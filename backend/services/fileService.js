import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Ensures the user's upload directory exists.
 * @param {string} userId
 * @returns {string} - Absolute path to the user's directory
 */
const ensureUserDir = async (userId) => {
  const userDir = path.join(UPLOADS_DIR, userId.toString());
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
};

/**
 * Saves code content to a .txt file.
 * @param {string} userId
 * @param {string} type - 'original' | 'refined'
 * @param {string} content
 * @returns {string} - Relative file path stored in DB (e.g. uploads/<userId>/<timestamp>_original.txt)
 */
export const saveCodeFile = async (userId, type, content) => {
  const userDir = await ensureUserDir(userId);
  const filename = `${Date.now()}_${type}.txt`;
  const absolutePath = path.join(userDir, filename);
  await fs.writeFile(absolutePath, content, 'utf8');
  // Store relative path for portability
  return path.join('uploads', userId.toString(), filename);
};

/**
 * Reads code content from a stored .txt file.
 * @param {string} relativePath - Path stored in DB
 * @returns {string} - File content
 */
export const readCodeFile = async (relativePath) => {
  const absolutePath = path.join(__dirname, '..', relativePath);
  try {
    return await fs.readFile(absolutePath, 'utf8');
  } catch {
    return null;
  }
};

/**
 * Deletes the code files associated with a history entry.
 * @param {string} originalPath
 * @param {string} refinedPath
 */
export const deleteCodeFiles = async (originalPath, refinedPath) => {
  const basePath = path.join(__dirname, '..');
  try {
    if (originalPath) await fs.unlink(path.join(basePath, originalPath));
    if (refinedPath) await fs.unlink(path.join(basePath, refinedPath));
  } catch {
    // Non-fatal: log but don't throw
    console.warn('Warning: Could not delete one or more code files.');
  }
};
