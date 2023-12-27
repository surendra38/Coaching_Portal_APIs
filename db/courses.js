const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_name: String,
  course_category: String,
  details: String,
  price: Number,
  url: String,
  keyFeature: [],
  image: String,
});
module.exports = mongoose.model("courses", courseSchema);
