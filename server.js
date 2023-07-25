/***************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: UTKARSH SHARMA Student ID: 135814226 Date: July 24, 2023
*
* Online (Cyclic) Link: https://determined-erin-bullfrog.cyclic.app/
*
****************************/

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const collegeData = require("./modules/collegeData");
const exphbs = require("express-handlebars").create({
  extname: ".hbs",
  defaultLayout: "main",
  helpers: {
    navLink: function(url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
        '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
});

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to parse JSON data
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Set the 'view engine' to use "express-handlebars"
app.engine("hbs", exphbs.engine);
app.set("view engine", "hbs");

// Middleware to highlight the correct navigation item
app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

// Route to get all students or students by course
app.get("/students", (req, res) => {
  const course = req.query.course;
  console.log(course);
  if (course) {
    collegeData
      .getStudentsByCourse(parseInt(course))
      .then((data) => {
        res.json(data);
      })
      .catch(() => res.json({ message: "no results" }));
  } else {
    collegeData
      .getAllStudents()
      .then((students) => res.render("students", { layout: "main", students: students }))
      .catch(() => res.render("students", { layout: "main", message: "no results" }));
  }
});

// Route to get all courses
app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => {
      if (courses.length > 0) {
        res.render("courses", { layout: "main", courses: courses });
      } else {
        res.render("courses", { layout: "main", message: "No courses available." });
      }
    })
    .catch(() => res.render("courses", { layout: "main", message: "No courses available." }));
});

// Route to get a specific course by courseId and render the course view
app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .getCourseById(courseId)
    .then((course) => res.render("course", { layout: "main", course: course }))
    .catch(() => res.status(404).send("Course Not Found"));
});

// Route to get a student by student number and render the student view
app.get("/student/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);
  collegeData
    .getStudentByNum(studentNum)
    .then((student) => res.render("student", { layout: "main", student: student }))
    .catch(() => res.status(404).send("Student Not Found"));
});

// Route to serve home.hbs
app.get("/", (req, res) => {
  res.render("home", { layout: "main" });
});

// Route to serve about.hbs
app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});

// Route to serve htmlDemo.hbs
app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo", { layout: "main" });
});

// Route to serve addStudent.hbs
app.get("/students/add", (req, res) => {
  res.render("addStudent", { layout: "main" });
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

// Route to update a student
app.post("/student/update", (req, res) => {
  const updatedStudent = req.body;

  // Log the data received from the form submission for debugging
  console.log("Received data from the form submission:");
  console.log(updatedStudent);

  collegeData
    .updateStudent(updatedStudent)
    .then(() => {
      // Log a success message for debugging
      console.log("Student updated successfully.");
      res.redirect("/students");
    })
    .catch((err) => {
      // Log the error message for debugging
      console.error("Error updating student:", err);
      res.status(404).send("Student Not Found");
    });
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
