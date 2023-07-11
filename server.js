/***************************
* WEB700 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: UTKARSH SHARMA Student ID: 135814226 Date: July 11,2023
*
* Online (Cyclic) Link: https://determined-erin-bullfrog.cyclic.app/
*
****************************/

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const collegeData = require("./modules/collegeData");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to parse JSON data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Route to get all students or students by course
app.get("/students", (req, res) => {
  const course = req.query.course;
  console.log(course);
  if (course) {
    collegeData.getStudentsByCourse(parseInt(course))
      .then((data) => {
        res.json(data);
      })
      .catch(() => res.json({ message: "no results" }));
  } else {
    collegeData.getAllStudents()
      .then((students) => res.json(students))
      .catch(() => res.json({ message: "no results" }));
  }
});

// Route to get all TAs
app.get("/tas", (req, res) => {
  collegeData.getTAs()
    .then((TAs) => res.json(TAs))
    .catch(() => res.json({ message: "no results" }));
});

// Route to get all courses
app.get("/courses", (req, res) => {
  collegeData.getCourses()
    .then((courses) => res.json(courses))
    .catch(() => res.json({ message: "no results" }));
});

// Route to get a student by student number
app.get("/student/:num", (req, res) => {
  const num = req.params.num;
  collegeData.getStudentByNum(parseInt(num))
    .then((student) => res.json(student))
    .catch(() => res.json({ message: "no results" }));
});

// Route to serve home.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

// Route to serve about.html
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Route to serve htmlDemo.html
app.get("/htmlDemo", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "htmlDemo.html"));
});

// Route to serve addStudent.html
app.get("/students/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addStudent.html"));
});

// Route to add a new student
app.post("/students/add", (req, res) => {
  const newStudent = req.body;
  collegeData
    .addStudent(newStudent)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => res.json({ message: "Failed to add student" }));
});

// 404 error message
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Initializing the collegeData module
collegeData
  .initialize()
  .then(() => {
    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing collegeData:", err);
  });
