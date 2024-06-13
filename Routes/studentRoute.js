const express = require('express');
const { register, login, getStudent, verifyOTP, verifyOTPByLandingPage, registerByLandingPage, registerByNumber, loginByNumber, verifyNumberOTP } = require('../Controller/User/Student/studentController');
const { addUpdateStudentProfile, deleteStudentProfile } = require('../Controller/User/Student/studentProfileController');
const { getAllApprovedCourseForStudent, getCourseByIdForPublicStudent, getMyCourses, myCourseByIdForStudent } = require('../Controller/Course/getCourseAndContent');
const { giveInstructorReview, deleteInstructorReview, getInstructorAverageRating, getInstructorReview } = require('../Controller/Review/instructorReviewController');
const { giveCourseReview, getCourseAverageRating, getCourseReview, deleteCourseReview } = require('../Controller/Review/courseReviewController');
const { applyCouponToCourse } = require('../Controller/Master/couponController');
const { createOrder, verifyPayment, createOrderYogaVolunteerCourse } = require('../Controller/User/Student/purchaseCourseController');
const { getYogaStudioByIdUser, getYogaStudioForUser } = require('../Controller/YogaStudio/getBusinessController');
const { getHomeTutorForUser, getHomeTutorByIdForUser, getNearestHomeTutorForUser, getHTTimeSloteForUser } = require('../Controller/HomeTutor/getHomeTutorController');
const { getTherapistByIdForUser, getTherapyForUser, getNearestTherapyForUser, getTherapyTimeSloteForUser } = require('../Controller/Therapy/getTherapyController');
const student = express.Router();

// middleware
const { verifyStudentJWT } = require('../Middleware/verifyJWTToken');
const { isStudentPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');

student.post("/register", register);
student.post("/login", login);
student.post("/verifyOTP", verifyOTP);
student.post("/registerByNumber", registerByNumber);
student.post("/loginByNumber", loginByNumber);
student.post("/verifyNumberOTP", verifyNumberOTP);
student.post("/verifyOTPByLandingPage", verifyOTPByLandingPage);
student.post("/registerByLandingPage", registerByLandingPage);
student.get("/student", verifyStudentJWT, getStudent);

student.post("/addUpdateStudentProfile", verifyStudentJWT, isStudentPresent, uploadImage.single("StudentProfile"), addUpdateStudentProfile);
student.delete("/deleteProfile/:id", verifyStudentJWT, isStudentPresent, deleteStudentProfile);

student.get("/courses", getAllApprovedCourseForStudent);
student.get("/courses/:id", getCourseByIdForPublicStudent);
student.get("/myCourses", verifyStudentJWT, isStudentPresent, getMyCourses);
student.get("/myCourses/:id", verifyStudentJWT, isStudentPresent, myCourseByIdForStudent);

student.post("/giveInstructorReview/:id", verifyStudentJWT, isStudentPresent, giveInstructorReview); //id = instructorId
student.get("/getInstructorAverageRating/:id", verifyStudentJWT, isStudentPresent, getInstructorAverageRating); //id = instructorId
student.get("/getInstructorReview/:id", verifyStudentJWT, isStudentPresent, getInstructorReview); //id = instructorId
student.delete("/deleteInstructorReview/:id", verifyStudentJWT, isStudentPresent, deleteInstructorReview); //id = review Id

student.post("/giveCourseReview/:id", verifyStudentJWT, isStudentPresent, giveCourseReview); //id = courseId
student.get("/getCourseReview/:id", verifyStudentJWT, isStudentPresent, getCourseReview); //id = courseId
student.get("/getCourseAverageRating/:id", verifyStudentJWT, isStudentPresent, getCourseAverageRating); //id = courseId
// student.delete("/deleteCourseReview/:id", verifyStudentJWT, isStudentPresent, deleteCourseReview); //id = review Id

// Coupon
student.put("/applyCouponToCourse", verifyStudentJWT, isStudentPresent, applyCouponToCourse);

// Order/Payment
student.post("/createOrder", verifyStudentJWT, isStudentPresent, createOrder);
student.post("/createOrderYogaVolunteerCourse", verifyStudentJWT, isStudentPresent, createOrderYogaVolunteerCourse);
student.post("/verifyPayment", verifyPayment);

student.get("/yogaStudios", verifyStudentJWT, isStudentPresent, getYogaStudioForUser);
student.get("/yogaStudios/:id", verifyStudentJWT, isStudentPresent, getYogaStudioByIdUser);

// Home Tutor
student.get("/homeTutors", verifyStudentJWT, isStudentPresent, getHomeTutorForUser);
student.get("/homeTutors/:id", verifyStudentJWT, isStudentPresent, getHomeTutorByIdForUser);
student.get("/nearestHomeTutors", verifyStudentJWT, isStudentPresent, getNearestHomeTutorForUser);
student.get("/getTimeSlote/:id", verifyStudentJWT, isStudentPresent, getHTTimeSloteForUser);

// Therapy
student.get("/thrapies", verifyStudentJWT, isStudentPresent, getTherapyForUser);
student.get("/thrapies/:id", verifyStudentJWT, isStudentPresent, getTherapistByIdForUser);
student.get("/nearestTherapies", verifyStudentJWT, isStudentPresent, getNearestTherapyForUser);
student.get("/getTimeSlote/:id", verifyStudentJWT, isStudentPresent, getTherapyTimeSloteForUser);

module.exports = student;