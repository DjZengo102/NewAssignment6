const fs = require('fs');

// Create a class
class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

// Initialize the data
function initialize() {
  return new Promise((resolve, reject) => {

    // Read the file students.json
    fs.readFile('./data/students.json', 'utf8', (err, studentDataFromFile) => {
      if (err) {
        reject("Unable to read students.json");
        return;
      }

      // Read the file courses.json
      fs.readFile('./data/courses.json', 'utf8', (err, courseDataFromFile) => {
        if (err) {
          reject("Unable to read courses.json");
          return;
        }

        const studentData = JSON.parse(studentDataFromFile);
        const courseData = JSON.parse(courseDataFromFile);

        dataCollection = new Data(studentData, courseData);

        resolve();
      });
    });
  });
}

// Create a function to get all students
function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject("No students found");
    }
  });
}

// Create a function to get all TAs
function getTAs() {
  return new Promise((resolve, reject) => {
    const TAs = dataCollection.students.filter(student => student.TA === true);

    if (TAs.length > 0) {
      resolve(TAs);
    } else {
      reject("No TAs found");
    }
  });
}

// Create a function to get all courses
function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject("Courses not found");
    }
  });
}

// ...

// Create a function to get students by course
function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    const students = dataCollection.students.filter(student => student.course === course);

    if (students.length > 0) {
      resolve(students);
    } else {
      reject("No results returned");
    }
  });
}

// Create a function to get a student by student number
function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    const student = dataCollection.students.find(student => student.studentNum === num);

    if (student) {
      resolve(student);
    } else {
      reject("No results returned");
    }
  });
}

// Create the addStudent function
function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (studentData.TA === undefined) {
      studentData.TA = false;
    } else {
      studentData.TA = true;
    }

    studentData.studentNum = dataCollection.students.length + 261;

    dataCollection.students.push(studentData);

    resolve(studentData);
  });
}

// Export functions
module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  addStudent
};
