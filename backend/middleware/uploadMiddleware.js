import multer from 'multer';

// Use memory storage — file content lives as a Buffer in req.file.buffer
// We handle persisting it ourselves via fileService.js
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept any plain-text file: .js, .ts, .py, .txt, .go, .php, etc.
  if (file.mimetype.startsWith('text/') || file.originalname.match(/\.(js|ts|jsx|tsx|py|go|php|rb|java|cs|cpp|c|html|css|json|txt)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only plain-text source code files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1 MB max
  },
});

export default upload;
