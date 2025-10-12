const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  resetOtp: String,
  resetOtpExpires: Date,
  emailVerificationOtp: String,
  emailVerificationExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

userSchema.pre("save", async function (next) {
  // Only hash password if it's not already hashed (check if it starts with $2b$)
  if (this.isModified("password") && !this.password.startsWith("$2b$")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});


module.exports = mongoose.model("User", userSchema);