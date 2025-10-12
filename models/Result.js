const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Made optional for existing data
    username: { type: String }, // Store username for reference
    answers: { type: [AnswerSchema], required: false, default: [] }, // Made optional for zero-answer submissions
    overallScore: { type: Number, required: true },
    subjectScores: {
      physics: { type: Number, default: 0 },
      chemistry: { type: Number, default: 0 },
      maths: { type: Number, default: 0 },
      biology: { type: Number, default: 0 },
      logicalreasoning: { type: Number, default: 0 }, // Added missing field
    },
    recommendedStream: { type: String, enum: ['Science', 'Commerce', 'Arts'], required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', ResultSchema);
