const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  categoryName: { type: String, unique: true, required: true },
  subjects: [
    {
      subjectId: { type: String, unique: true, required: true },
      name: String,
    },
  ],
});

module.exports = mongoose.model("courses", courseSchema);
