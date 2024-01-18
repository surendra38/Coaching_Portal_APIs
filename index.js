const express = require("express");
const cors = require("cors");
require("./db/config");
const jwt = require("jsonwebtoken");
const Student = require("./db/students");
const Courses = require("./db/courses");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());
const JWT_SECRET = "your-secret-key";

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by username
    const user = await Student.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate a JWT token for authentication
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, categoryName, dateOfBirth, password } =
      req.body;

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the student already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res
        .status(400)
        .json({ error: "Student with this email already exists" });
    }

    // Create a new student
    const student = new Student({
      name,
      email,
      mobile,
      categoryName,
      dateOfBirth,
      password: hashedPassword,
    });

    // Save the student to the database
    await student.save();

    // Generate a JWT token for authentication
    const token = jwt.sign({ email: student.email }, JWT_SECRET);

    res.status(201).json({ message: "Student registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add categories api
app.post("/api/categories", async (req, res) => {
  try {
    const courses = new Courses(req.body);
    await courses.save();
    res.status(201).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add courses api
app.post("/api/categories/:categoryId/subjects", async (req, res) => {
  try {
    const { subjectId, name } = req.body;
    const categoryId = req.params.categoryId;

    const updatedCategory = await Courses.findByIdAndUpdate(
      categoryId,
      { $push: { subjects: { subjectId, name } } },
      { new: true }
    );

    res.status(201).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get categories api
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Courses.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a subject within a category
app.put("/api/categories/:categoryId/subjects/:subjectId", async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId, subjectId } = req.params;

    const updatedCategory = await Courses.findOneAndUpdate(
      { _id: categoryId, "subjects.subjectId": subjectId },
      { $set: { "subjects.$.name": name } },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category or subject not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a category
app.put("/api/categories/:categoryId", async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId } = req.params;

    const updatedCategory = await Courses.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
