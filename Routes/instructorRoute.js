const express = require('express');
const { register, login, getInstructor, changePassword } = require('../Controller/User/Instructor/instructorController');
const instructor = express.Router();

// middleware
const { verifyInstructorJWT } = require('../Middleware/verifyJWTToken');
const { isInstructorPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/singleImage');
const uploadMultiPDF = require('../Middleware/uploadFile/multiPDF');

instructor.post("/register", register);
instructor.post("/login", login);
instructor.get("/instructor", verifyInstructorJWT, isInstructorPresent, getInstructor);
instructor.put("/changePassword", verifyInstructorJWT, isInstructorPresent, changePassword);


module.exports = instructor;