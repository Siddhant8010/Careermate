const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      unique: true,
      sparse: true // Allow multiple null values but ensure uniqueness for non-null values
    },
    subject: {
      type: String,
      enum: ['physics', 'chemistry', 'maths', 'biology', 'logicalreasoning'],
      required: true,
      lowercase: true,
      trim: true,
    },
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length >= 2; // at least 2 options
        },
        message: 'A question must have at least two options',
      },
      required: true,
    },
    correctAnswer: { type: String, required: true }, // should match one of options
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
