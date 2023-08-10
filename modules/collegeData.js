const Sequelize = require('sequelize');
const sequelize = new Sequelize('mhcsihlp', 'mhcsihlp', 'M7cvcfl79bnKizEArCLurS3HXYvqJtmh', {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Define Student model
const Student = sequelize.define('Student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING
});

// Define Course model
const Course = sequelize.define('Course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING
});

// Define relationship between Course and Student
Course.hasMany(Student, { foreignKey: 'course' });

// Initialize the data and sync the models with the database
function initialize() {
  return sequelize
    .sync()
    .then(() => {
      return;
    })
    .catch(err => {
      throw new Error("Unable to sync the database: " + err);
    });
}

// Create a function to write data to the students.json file
function writeStudentDataToFile() {
  return new Promise((resolve, reject) => {
    reject(); // Placeholder for later implementation
  });
}

// Create the addStudent function
function addStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;

  for (const prop in studentData) {
    if (studentData[prop] === "") {
      studentData[prop] = null;
    }
  }

  return Student.create(studentData)
    .then(() => {
      return;
    })
    .catch(err => {
      throw new Error("Unable to create student: " + err);
    });
}

// Create the updateStudent function
function updateStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;

  for (const prop in studentData) {
    if (studentData[prop] === "") {
      studentData[prop] = null;
    }
  }

  return Student.update(studentData, {
    where: {
      studentNum: studentData.studentNum
    }
  })
    .then(() => {
      return;
    })
    .catch(err => {
      throw new Error("Unable to update student: " + err);
    });
}

// Create a function to delete a student by student number
function deleteStudentByNum(studentNum) {
  return Student.destroy({
    where: {
      studentNum: studentNum
    }
  })
    .then(affectedRows => {
      if (affectedRows > 0) {
        return;
      } else {
        throw new Error("No student deleted");
      }
    })
    .catch(err => {
      throw new Error("Error deleting student: " + err);
    });
}

// Create a function to get all students
function getAllStudents() {
  return Student.findAll()
    .then(students => {
      if (students.length > 0) {
        return students;
      } else {
        throw new Error("No students found");
      }
    })
    .catch(err => {
      throw new Error("Error fetching students: " + err);
    });
}

// Create a function to get students by course
function getStudentsByCourse(course) {
  return Student.findAll({
    where: {
      course: course
    }
  })
    .then(students => {
      if (students.length > 0) {
        return students;
      } else {
        throw new Error("No results returned");
      }
    })
    .catch(err => {
      throw new Error("Error fetching students by course: " + err);
    });
}

// Create a function to get a student by student number
function getStudentByNum(num) {
  return Student.findOne({
    where: {
      studentNum: num
    }
  })
    .then(student => {
      if (student) {
        return student;
      } else {
        throw new Error("No results returned");
      }
    })
    .catch(err => {
      throw new Error("Error fetching student by number: " + err);
    });
}

// Create a function to get all courses
function getCourses() {
  return Course.findAll()
    .then(courses => {
      if (courses.length > 0) {
        return courses;
      } else {
        throw new Error("No results returned");
      }
    })
    .catch(err => {
      throw new Error("Error fetching courses: " + err);
    });
}

// Create a function to get a course by courseId
function getCourseById(id) {
  return Course.findOne({
    where: {
      courseId: id
    }
  })
    .then(course => {
      if (course) {
        return course;
      } else {
        throw new Error("No results returned");
      }
    })
    .catch(err => {
      throw new Error("Error fetching course by ID: " + err);
    });
}

// Create a function to add a new course
function addCourse(courseData) {
  for (const prop in courseData) {
    if (courseData[prop] === "") {
      courseData[prop] = null;
    }
  }

  return Course.create(courseData)
    .then(() => {
      return;
    })
    .catch(err => {
      throw new Error("Unable to create course: " + err);
    });
}

// Create a function to update a course
function updateCourse(courseData) {
  for (const prop in courseData) {
    if (courseData[prop] === "") {
      courseData[prop] = null;
    }
  }

  return Course.update(courseData, {
    where: {
      courseId: courseData.courseId
    }
  })
    .then(() => {
      return;
    })
    .catch(err => {
      throw new Error("Unable to update course: " + err);
    });
}

// Create a function to delete a course by courseId
function deleteCourseById(id) {
  return Course.destroy({
    where: {
      courseId: id
    }
  })
    .then(affectedRows => {
      if (affectedRows > 0) {
        return;
      } else {
        throw new Error("No course deleted");
      }
    })
    .catch(err => {
      throw new Error("Error deleting course: " + err);
    });
}

// Export functions
module.exports = {
  initialize,
  writeStudentDataToFile,
  addStudent,
  updateStudent,
  deleteStudentByNum,
  getAllStudents,
  getStudentsByCourse,
  getStudentByNum,
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourseById
};
