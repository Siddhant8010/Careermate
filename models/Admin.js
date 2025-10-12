const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Admin username is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Admin password is required"],
  },
  email: {
    type: String,
    required: [true, "Admin email is required"],
    unique: true,
  },
  role: {
    type: String,
    default: "admin",
    immutable: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
