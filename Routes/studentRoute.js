const express = require('express');
const { register, login, getStudent, changePassword } = require('../Controller/User/Student/studentController');
const student = express.Router();

// middleware
const { verifyStudentJWT } = require('../Middleware/verifyJWTToken');
const { isStudentPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/singleImage');
const uploadMultiPDF = require('../Middleware/uploadFile/multiPDF');

student.post("/register", register);
student.post("/login", login);
student.get("/student", verifyStudentJWT, isStudentPresent, getStudent);
student.put("/changePassword", verifyStudentJWT, isStudentPresent, changePassword);


module.exports = student;