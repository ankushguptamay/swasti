const express = require('express');
const { register, login, getStudent, changePassword } = require('../Controller/User/Student/studentController');
const { addStudentProfile, deleteStudentProfile } = require('../Controller/User/Student/studentProfileController');
const { getAllApprovedCourseForStudent, getCourseByIdForStudent } = require('../Controller/Course/getCourseAndContent');
const { studentToCourse } = require('../Controller/Course/updateCourseAndContent');
const student = express.Router();

// middleware
const { verifyStudentJWT } = require('../Middleware/verifyJWTToken');
const { isStudentPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');

student.post("/register", register);
student.post("/login", login);
student.get("/student", verifyStudentJWT, isStudentPresent, getStudent);
student.put("/changePassword", verifyStudentJWT, isStudentPresent, changePassword);

student.post("/addProfile", verifyStudentJWT, isStudentPresent, uploadImage.single("StudentProfile"), addStudentProfile);
student.delete("/deleteProfile/:id", verifyStudentJWT, isStudentPresent, deleteStudentProfile);

student.get("/courses", verifyStudentJWT, isStudentPresent, getAllApprovedCourseForStudent);
student.put("/studentToCourse/:id", verifyStudentJWT, isStudentPresent, studentToCourse);
student.get("/courses/:id", verifyStudentJWT, isStudentPresent, getCourseByIdForStudent);

module.exports = student;