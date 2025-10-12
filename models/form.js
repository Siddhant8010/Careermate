const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, 
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 15,
      max: 25,
    },
    dob: {
      type: Date,
      required: true,
    },

   
    tenthPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    board: {
      type: String,
      required: true,
      enum: ["SSC", "CBSE", "ICSE"],
    },
    physicsMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    chemistryMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    mathsMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    biologyMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    interest: {
      type: String,
      required: true,
      trim: true,
    },

    // Consents
    accuracyConsent: {
      type: Boolean,
      required: true,
    },
    contactConsent: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
