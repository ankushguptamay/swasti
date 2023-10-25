const express = require('express');
const { register, login, getInstructor, changePassword } = require('../Controller/User/Instructor/instructorController');
const { addInstructorProfile, deleteInstructorProfile } = require('../Controller/User/Instructor/instructorProfileController');
const { deleteInstructorReview, getInstructorAverageRating, getInstructorReview } = require('../Controller/Review/instructorReviewController');
const { addCourse, addCourseImage, addTeacherImage, addContent, addContentVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { getAllApprovedCourse, getCourseByIdForInstructor, getAllPendingCourse, getAllRejectedCourse } = require('../Controller/Course/getCourseAndContent');
const { softDeleteContentForInstructor, softDeleteCourseForInstructor, softDeleteFileForInstructor } = require('../Controller/Course/deleteCourseAndContent');
const { getAllCourseCategory } = require('../Controller/Master/courseCategoryController');
const { addDiscountToCourse } = require('../Controller/Course/updateCourseAndContent');
const { createDiscount, softDeleteDiscount, getAllInstructorDiscount } = require('../Controller/Master/discountController');
const { getCourseAverageRating, getCourseReview, deleteCourseReview } = require('../Controller/Review/courseReviewController');
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

instructor.post("/addProfile", verifyInstructorJWT, isInstructorPresent, uploadImage.single("InstructorProfile"), addInstructorProfile);
instructor.delete("/deleteProfile/:id", verifyInstructorJWT, isInstructorPresent, deleteInstructorProfile);

// Course And Content
// 1. Add
instructor.post("/addCourse", verifyInstructorJWT, isInstructorPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
instructor.post("/addCourseImage/:id", verifyInstructorJWT, isInstructorPresent, uploadImage.single("CourseImage"), addCourseImage); // courseId
instructor.post("/addTeacherImage/:id", verifyInstructorJWT, isInstructorPresent, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
instructor.post("/addContent", verifyInstructorJWT, isInstructorPresent, addContent); // courseId
instructor.post("/addContentFile/:id", verifyInstructorJWT, isInstructorPresent, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
instructor.post("/addContentVideo/:id", verifyInstructorJWT, isInstructorPresent, addContentVideo); // contentId
// 2. Get
instructor.get("/courses", verifyInstructorJWT, isInstructorPresent, getAllApprovedCourse); // Approved
instructor.get("/courses/:id", verifyInstructorJWT, isInstructorPresent, getCourseByIdForInstructor);
instructor.get("/pendingCourse", verifyInstructorJWT, isInstructorPresent, getAllPendingCourse); // Pending
instructor.get("/rejectedCourse", verifyInstructorJWT, isInstructorPresent, getAllRejectedCourse); // Rejected
// 3. Delete
instructor.delete("/softDeleteCourse/:id", verifyInstructorJWT, isInstructorPresent, softDeleteCourseForInstructor);
instructor.delete("/softDeleteContent/:id", verifyInstructorJWT, isInstructorPresent, softDeleteContentForInstructor);
instructor.delete("/softDeleteFile/:id", verifyInstructorJWT, isInstructorPresent, softDeleteFileForInstructor);
// 4. Update
instructor.put("/addDiscountToCourse/:id", verifyInstructorJWT, isInstructorPresent, addDiscountToCourse); // courseId

// Master
// 1. Coursecategory
instructor.get("/coursecategories", verifyInstructorJWT, isInstructorPresent, getAllCourseCategory);
// 2. Discount
instructor.post("/createDiscount", verifyInstructorJWT, isInstructorPresent, createDiscount);
instructor.delete("/softDeleteDiscount/:id", verifyInstructorJWT, isInstructorPresent, softDeleteDiscount);
instructor.get("/instructorDiscount", verifyInstructorJWT, isInstructorPresent, getAllInstructorDiscount);

// Review
// 1. Instructor Review
instructor.get("/getInstructorAverageRating", verifyInstructorJWT, isInstructorPresent, getInstructorAverageRating);
instructor.get("/getInstructorReview", verifyInstructorJWT, isInstructorPresent, getInstructorReview);
instructor.delete("/deleteInstructorReview/:id", verifyInstructorJWT, isInstructorPresent, deleteInstructorReview); //id = review Id
// 2. Course Review
instructor.get("/getCourseReview/:id", verifyInstructorJWT, isInstructorPresent, getCourseReview); // id = courseId
instructor.get("/getCourseAverageRating/:id", verifyInstructorJWT, isInstructorPresent, getCourseAverageRating); // id = courseId
instructor.delete("/deleteCourseReview/:id", verifyInstructorJWT, isInstructorPresent, deleteCourseReview); //id = review Id

module.exports = instructor;