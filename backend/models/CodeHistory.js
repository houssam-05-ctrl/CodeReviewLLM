import mongoose from 'mongoose';

const codeHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    // Filesystem paths to .txt files (not raw code strings)
    originalFilePath: {
      type: String,
      required: true,
    },
    refinedFilePath: {
      type: String,
    },
    issuesFound: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const CodeHistory = mongoose.model('CodeHistory', codeHistorySchema);

export default CodeHistory;
