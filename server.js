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

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("hbs", exphbs.engine);
app.set("view engine", "hbs");

app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

app.get("/students", (req, res) => {
  const course = req.query.course;
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
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { layout: "main", students: students });
        } else {
          res.render("students", { layout: "main", message: "No students available." });
        }
      })
      .catch(() => res.render("students", { layout: "main", message: "No students available." }));
  }
});

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

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .getCourseById(courseId)
    .then((course) => res.render("course", { layout: "main", course: course }))
    .catch(() => res.status(404).send("Course Not Found"));
});

app.get("/student/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);
  let viewData = {};
  
  collegeData
    .getStudentByNum(studentNum)
    .then((student) => {
      viewData.student = student;
    })
    .catch(() => {
      viewData.student = null;
    })
    .then(collegeData.getCourses)
    .then((courses) => {
      viewData.courses = courses;
      
      if (viewData.student) {
        viewData.courses.forEach((course) => {
          if (course.courseId === viewData.student.course) {
            course.selected = true;
          }
        });
      }
    })
    .catch(() => {
      viewData.courses = [];
    })
    .then(() => {
      if (!viewData.student) {
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { layout: "main", viewData: viewData });
      }
    });
});

app.get("/", (req, res) => {
  res.render("home", { layout: "main" });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo", { layout: "main" });
});

app.get("/students/add", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => {
      res.render("addStudent", { layout: "main", courses: courses });
    })
    .catch(() => res.render("addStudent", { layout: "main", courses: [] }));
});

app.post("/students/add", (req, res) => {
  const newStudent = req.body;
  collegeData
    .addStudent(newStudent)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => res.json({ message: "Failed to add student" }));
});

app.post("/student/update", (req, res) => {
  const updatedStudent = req.body;
  console.log("Received data from the form submission:");
  console.log(updatedStudent);
  collegeData
    .updateStudent(updatedStudent)
    .then(() => {
      console.log("Student updated successfully.");
      res.redirect("/students");
    })
    .catch((err) => {
      console.error("Error updating student:", err);
      res.status(404).send("Student Not Found");
    });
});

app.get("/courses/add", (req, res) => {
  res.render("addCourse", { layout: "main" });
});

app.post("/courses/add", (req, res) => {
  const newCourse = req.body;
  collegeData
    .addCourse(newCourse)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => res.json({ message: "Failed to add course" }));
});

app.post("/course/update", (req, res) => {
  const updatedCourse = req.body;
  collegeData
    .updateCourse(updatedCourse)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      console.error("Error updating course:", err);
      res.status(404).send("Course Not Found");
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .getCourseById(courseId)
    .then((course) => {
      if (course) {
        res.render("course", { layout: "main", course: course });
      } else {
        res.status(404).send("Course Not Found");
      }
    })
    .catch((err) => {
      console.error("Error getting course:", err);
      res.status(500).send("Server Error");
    });
});

app.get("/course/delete/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .deleteCourseById(courseId)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => res.status(500).send("Unable to Remove Course / Course not found"));
});

// New route for deleting students
app.get("/student/delete/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);
  collegeData
    .deleteStudentByNum(studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => res.status(500).send("Unable to Remove Student / Student not found"));
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing collegeData:", err);
  });
