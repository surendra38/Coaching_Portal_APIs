const express = require("express");
const cors = require("cors");
require("./db/config");
const jwt = require("jsonwebtoken");
const Student = require("./db/students");
const Courses = require("./db/courses");
const app = express();
app.use(express.json());
app.use(cors());
const jwtKey = "e-coaching";

app.post("/login", async (req, res) => {
  console.log(req.body);
  if (req.body.password && req.body.email) {
    let student = await Student.findOne(req.body).select("-password");
    if (student) {
      jwt.sign({ student }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({
            result: "Something went wrong, Please try after sometime",
          });
        }
        res.send({ student, auth: token });
      });
    } else {
      res.send({ result: "No User Found" });
    }
  } else {
    res.send("No user Found");
  }
});

app.post("/registerStudent", async (req, res) => {
  let students = new Student(req.body);
  let result = students.save();
  let resultData = await result;
  resultData = resultData.toObject();
  delete resultData.password;
  jwt.sign({ resultData }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({
        resultData: "Something went wrong, Please try after sometime",
      });
    }
    res.send({ resultData, auth: token });
  });
});

app.post("/courses", verifyToken, async (req, res) => {
  let courses = new Courses(req.body);
  let result = courses.save();
  res.send(result);
});

app.get("/getCoursesList", async (req, res) => {
  const result = await Courses.find({}).select("course_name");
  res.send(result);
});

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        res.status(401).send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(403).send({ result: "Please add token with header" });
  }
}

app.listen(3000);
