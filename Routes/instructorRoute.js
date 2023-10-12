const express = require('express');
const { register, login, getInstructor, changePassword } = require('../Controller/User/Instructor/instructorController');
const { addCourse } = require('../Controller/Course/createCourseAndContent');
const { getAllApprovedCourse, getCourseByIdForInstructor, getAllPendingCourse, getAllRejectedCourse } = require('../Controller/Course/getCourseAndContent');
const instructor = express.Router();

// middleware
const { verifyInstructorJWT } = require('../Middleware/verifyJWTToken');
const { isInstructorPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');

instructor.post("/register", register);
instructor.post("/login", login);
instructor.get("/instructor", verifyInstructorJWT, isInstructorPresent, getInstructor);
instructor.put("/changePassword", verifyInstructorJWT, isInstructorPresent, changePassword);

// Course
instructor.post("/addCourse", verifyInstructorJWT, isInstructorPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
instructor.get("/courses", verifyInstructorJWT, isInstructorPresent, getAllApprovedCourse); // Approved
instructor.get("/courses/:id", verifyInstructorJWT, isInstructorPresent, getCourseByIdForInstructor);
instructor.get("/pendingCourse", verifyInstructorJWT, isInstructorPresent, getAllPendingCourse); // Pending
instructor.get("/rejectedCourse", verifyInstructorJWT, isInstructorPresent, getAllRejectedCourse); // Rejected

module.exports = instructor;