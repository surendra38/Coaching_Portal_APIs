const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: { type: Number, required: true },
  dateOfBirth: { type: String, required: true },
  categoryName: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("students", studentSchema);
