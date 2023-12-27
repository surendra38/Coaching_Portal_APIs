const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: Number,
  dateOfBirth: String,
  programCategory: String,
  password:String,
  city: String,
});
module.exports = mongoose.model("students", studentSchema);
