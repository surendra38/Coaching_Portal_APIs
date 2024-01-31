const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  lectureId: { type: Number, required: true },
  title: { type: String, required: true },
  videoURL: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  uploadDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema({
  categoryName: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  title: { type: String, required: true },
  courses: [
    {
      courseName: { type: String, unique: true, required: true },
      description: { type: String },
      instructor: { type: String },
      price: { type: Number },
      keyPoint: Array,
      lectures: [lectureSchema],
      // wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "students" }], // Array of students IDs for wishlist
      // cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "students" }], // Array of students IDs for cart
      isPublished: { type: Boolean, default: false }, // Added isPublished field
      isDeleted: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("courses", courseSchema);
