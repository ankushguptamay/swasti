const express = require('express');
const { register, login, getStudent, changePassword } = require('../Controller/User/Student/studentController');
const { getAllApprovedCourseForStudent, getCourseByIdForStudent } = require('../Controller/Course/getCourseAndContent');
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

student.get("/courses", verifyStudentJWT, isStudentPresent, getAllApprovedCourseForStudent);
// student.get("/courses/:id", verifyStudentJWT, isStudentPresent, getCourseByIdForStudent);

module.exports = student;