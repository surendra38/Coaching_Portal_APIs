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
  wishlist: [{ type: mongoose.Schema.Types.ObjectId }],
  cart: [{ type: mongoose.Schema.Types.ObjectId }],
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("students", studentSchema);
