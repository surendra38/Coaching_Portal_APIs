const express = require("express");
const cors = require("cors");
require("./db/config");
const jwt = require("jsonwebtoken");
const Student = require("./models/students");
const Courses = require("./models/courses");
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
    const { categoryName, description } = req.body;

    const existingCategory = await Courses.findOne({ categoryName });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const courses = new Courses({ categoryName, description });
    await courses.save();
    res.status(201).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add courses api
app.post("/api/add-course/:categoryId", async (req, res) => {
  try {
    const { courseName, description, instructor, price } = req.body;
    const categoryId = req.params.categoryId;

    const updatedCategory = await Courses.findByIdAndUpdate(
      categoryId,
      {
        $push: { subjects: { courseName, description, instructor, price } },
      },
      { new: true }
    );

    res.status(201).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// save a lecture by category and course id
app.post("/api/add-lecture/:categoryId/:courseId", async (req, res) => {
  try {
    const { categoryId, courseId } = req.params;
    const { lectureData } = req.body;

    // Find the category by ID
    const category = await Courses.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Find the course within the category by ID
    const course = category.subjects.find((c) => c._id.toString() === courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    // Add the new lecture to the course's lectures array
    const updatedCategory = await Courses.findOneAndUpdate(
      { _id: categoryId, "subjects._id": courseId },
      { $push: { "subjects.$.lectures": lectureData } },
      { new: true }
    );

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a subject within a category
app.put("/api/categories/:categoryId/subjects/:subjectId", async (req, res) => {
  try {
    const { courseName } = req.body;
    const { categoryId, subjectId } = req.params;

    const updatedCategory = await Courses.findOneAndUpdate(
      { _id: categoryId, "subjects._id": subjectId },
      { $set: { "subjects.$.courseName": courseName } },
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

// delete a course by id
app.delete("/api/delete-course/:categoryId/:courseId", async (req, res) => {
  try {
    const { categoryId, courseId } = req.params;
    // Find the category by ID
    const category = await Courses.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    // Find the course within the category by ID
    const course = category.subjects.find((c) => c._id == courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }
    // Remove the course from the course's lectures array
    course.deleteOne();

    await category.save();

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a lecture by id
app.delete(
  "/api/delete-lecture/:categoryId/:courseId/:lectureId",
  async (req, res) => {
    try {
      const { categoryId, courseId, lectureId } = req.params;
      // Find the category by ID
      const category = await Courses.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found." });
      }
      // Find the course within the category by ID
      const course = category.subjects.find((c) => c._id == courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found." });
      }
      // Find the lecture within the course by ID
      const lecture = course.lectures.find((c) => c._id == lectureId);

      if (!lecture) {
        return res.status(404).json({ error: "Lecture not found." });
      }
      // Remove the lecture from the course's lectures array
      lecture.deleteOne();

      await category.save();

      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get categories api
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Courses.find();
    res.status(200).json(categories);
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
