const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // For handling cross-origin requests
const helmet = require('helmet'); // Import helmet; enable this
const csrf = require('csurf'); // Import csurf; enable this
const cookieParser = require('cookie-parser'); // Import cookie-parser for CSRF token handling; enable this

const app = express();
const port = 3000;
require("dotenv").config();

// Middleware
app.use(cors()); // Use this to allow cross-origin requests
app.use(express.json()); // For parsing application/json
app.use(helmet()); // Use helmet to set secure HTTP headers; enable this
app.use(cookieParser()); // Use cookie-parser middleware; enable this

// // CSRF protection
const csrfProtection = csrf({ cookie: true });  // enable this
app.use(csrfProtection);  // enable this

// MongoDB connection string
process.env.MONGO_URI = "mongodb+srv://jokwuoma:NfVkmCxqTKSGUw9i@cluster0.c07r4.mongodb.net/";
const dbUri = process.env.MONGO_URI;

mongoose
  .connect(dbUri)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Define a schema for the quiz questions
const questionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    answer: Number, // Assuming this is the index of the correct option in the options array
  },
  { collection: "questions" },
);

// Create a model from the schema
const Question = mongoose.model("Question", questionSchema);

// Routes
// GET all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    console.log(questions);
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST a new question
// // Modified route to include csrfProtection as middleware
// app.post("/api/questions", csrfProtection, async (req, res) => { // Protect this route with CSRF - Line modified

app.post("/api/questions", async (req, res) => {
  const question = new Question({
    question: req.body.question,
    options: req.body.options,
    answer: req.body.answer,
  });

  try {
    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Additional routes for updating and deleting questions can be added here

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Quiz API listening at http://0.0.0.0:${port}`);
});
