const express = require('express');
const { register, login, getInstructor, changePassword } = require('../Controller/User/Instructor/instructorController');
const { addCourse, addCourseImage, addTeacherImage, addContent, addContentVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { getAllApprovedCourse, getCourseByIdForInstructor, getAllPendingCourse, getAllRejectedCourse } = require('../Controller/Course/getCourseAndContent');
const { softDeleteContentForInstructor, softDeleteCourseForInstructor } = require('../Controller/Course/deleteCourseAndContent');
const instructor = express.Router();

// middleware
const { verifyInstructorJWT } = require('../Middleware/verifyJWTToken');
const { isInstructorPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');
const uploadPDF = require('../Middleware/uploadFile/pdf');

instructor.post("/register", register);
instructor.post("/login", login);
instructor.get("/instructor", verifyInstructorJWT, isInstructorPresent, getInstructor);
instructor.put("/changePassword", verifyInstructorJWT, isInstructorPresent, changePassword);

// Course And Content
instructor.post("/addCourse", verifyInstructorJWT, isInstructorPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
instructor.post("/addCourseImage/:id", verifyInstructorJWT, isInstructorPresent, uploadImage.single("CourseImage"), addCourseImage); // courseId
instructor.post("/addTeacherImage/:id", verifyInstructorJWT, isInstructorPresent, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
instructor.post("/addContent", verifyInstructorJWT, isInstructorPresent, addContent); // courseId
instructor.post("/addContentFile/:id", verifyInstructorJWT, isInstructorPresent, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
instructor.post("/addContentVideo/:id", verifyInstructorJWT, isInstructorPresent, addContentVideo); // contentId
instructor.get("/courses", verifyInstructorJWT, isInstructorPresent, getAllApprovedCourse); // Approved
instructor.get("/courses/:id", verifyInstructorJWT, isInstructorPresent, getCourseByIdForInstructor);
instructor.get("/pendingCourse", verifyInstructorJWT, isInstructorPresent, getAllPendingCourse); // Pending
instructor.get("/rejectedCourse", verifyInstructorJWT, isInstructorPresent, getAllRejectedCourse); // Rejected
instructor.delete("/softDeleteCourse/:id", verifyInstructorJWT, isInstructorPresent, softDeleteCourseForInstructor);
instructor.delete("/softDeleteContent/:id", verifyInstructorJWT, isInstructorPresent, softDeleteContentForInstructor);

module.exports = instructor;