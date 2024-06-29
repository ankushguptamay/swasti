const express = require('express');
const { register, login, getStudent, verifyOTP, verifyOTPByLandingPage, registerByLandingPage, registerByNumber, loginByNumber, verifyNumberOTP, getMyChakra } = require('../Controller/User/Student/studentController');
const { addUpdateStudentProfile, deleteStudentProfile } = require('../Controller/User/Student/studentProfileController');
const { getAllApprovedCourseForStudent, getCourseByIdForPublicStudent, getMyCourses, myCourseByIdForStudent } = require('../Controller/Course/getCourseAndContent');
const { giveInstructorReview, deleteInstructorReview, getInstructorAverageRating, getInstructorReview } = require('../Controller/Review/instructorReviewController');
const { giveCourseReview, getCourseAverageRating, getCourseReview, deleteCourseReview } = require('../Controller/Review/courseReviewController');
const { applyCouponToCourse } = require('../Controller/Master/couponController');
const { createOrder, verifyPayment, createOrderYogaVolunteerCourse } = require('../Controller/User/Student/purchaseCourseController');
const { getYogaStudioByIdUser, getYogaStudioForUser } = require('../Controller/YogaStudio/getBusinessController');
const { getHomeTutorForUser, getHomeTutorByIdForUser, getNearestHomeTutorForUser, getHTTimeSloteForUser } = require('../Controller/HomeTutor/getHomeTutorController');
const { getTherapistByIdForUser, getTherapyForUser, getNearestTherapyForUser, getTherapyTimeSloteForUser } = require('../Controller/Therapy/getTherapyController');
const { giveYSReview, getYSAverageRating, getYSReview, softDeleteYSReview, updateYSReview } = require('../Controller/Review/ySReviewController');
const { createHTOrder, verifyHTPayment, getMyHTBookedSloteForUser } = require('../Controller/HomeTutor/hTBookingController');
const { giveHTReviewForUser, getHTAverageRating, getHTReview, updateHTReview, softDeleteHTReview } = require('../Controller/Review/hTReviewController');
const { getAdminBanner } = require('../Controller/Master/bannerController');
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
// student.post("/verifyOTPByLandingPage", verifyOTPByLandingPage);
// student.post("/registerByLandingPage", registerByLandingPage);
student.get("/student", verifyStudentJWT, getStudent);
student.get("/chakras", verifyStudentJWT, getMyChakra);

student.post("/addUpdateStudentProfile", verifyStudentJWT, isStudentPresent, uploadImage.single("StudentProfile"), addUpdateStudentProfile);
student.delete("/deleteProfile/:id", verifyStudentJWT, isStudentPresent, deleteStudentProfile);

student.get("/courses", getAllApprovedCourseForStudent);
student.get("/courses/:id", getCourseByIdForPublicStudent);
student.get("/myCourses", verifyStudentJWT, isStudentPresent, getMyCourses);
student.get("/myCourses/:id", verifyStudentJWT, isStudentPresent, myCourseByIdForStudent);

// Instructor Review
student.post("/giveInstructorReview/:id", verifyStudentJWT, isStudentPresent, giveInstructorReview); //id = instructorId
student.get("/getInstructorAverageRating/:id", verifyStudentJWT, isStudentPresent, getInstructorAverageRating); //id = instructorId
student.get("/getInstructorReview/:id", verifyStudentJWT, isStudentPresent, getInstructorReview); //id = instructorId
student.delete("/deleteInstructorReview/:id", verifyStudentJWT, isStudentPresent, deleteInstructorReview); //id = review Id
// Course Review
student.post("/giveCourseReview/:id", verifyStudentJWT, isStudentPresent, giveCourseReview); //id = courseId
student.get("/getCourseReview/:id", verifyStudentJWT, isStudentPresent, getCourseReview); //id = courseId
student.get("/getCourseAverageRating/:id", verifyStudentJWT, isStudentPresent, getCourseAverageRating); //id = courseId
// student.delete("/deleteCourseReview/:id", verifyStudentJWT, isStudentPresent, deleteCourseReview); //id = review Id

// Yoga Studio Review
student.post("/giveYSReview/:id", verifyStudentJWT, isStudentPresent, giveYSReview); //id = businessId
student.get("/ySAverageRating/:id", verifyStudentJWT, isStudentPresent, getYSAverageRating); //id = businessId
student.get("/ySReview/:id", verifyStudentJWT, isStudentPresent, getYSReview); //id = businessId
student.delete("/deleteYSReview/:id", verifyStudentJWT, isStudentPresent, softDeleteYSReview); //id = review Id
student.put("/updateYSReview/:id", verifyStudentJWT, isStudentPresent, updateYSReview); //id = review Id

// Home Tutor Review
student.post("/giveHTReview/:id", verifyStudentJWT, isStudentPresent, giveHTReviewForUser); //id = homeTutorId
student.get("/hTAverageRating/:id", verifyStudentJWT, isStudentPresent, getHTAverageRating); //id = homeTutorId
student.get("/hTReview/:id", verifyStudentJWT, isStudentPresent, getHTReview); //id = homeTutorId
student.delete("/deleteHTReview/:id", verifyStudentJWT, isStudentPresent, softDeleteHTReview); //id = review Id
student.put("/updateHTReview/:id", verifyStudentJWT, isStudentPresent, updateHTReview); //id = review Id

// Coupon
student.put("/applyCouponToCourse", verifyStudentJWT, isStudentPresent, applyCouponToCourse);

// Master
student.get("/adminBanners", verifyStudentJWT, isStudentPresent, getAdminBanner);

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

student.get("/myHTBookedSlotes", verifyStudentJWT, isStudentPresent, getMyHTBookedSloteForUser);
student.post("/createHTOrder", verifyStudentJWT, isStudentPresent, createHTOrder);
student.post("/verifyHTPayment", verifyHTPayment);

// Therapy
student.get("/thrapies", verifyStudentJWT, isStudentPresent, getTherapyForUser);
student.get("/thrapies/:id", verifyStudentJWT, isStudentPresent, getTherapistByIdForUser);
student.get("/nearestTherapies", verifyStudentJWT, isStudentPresent, getNearestTherapyForUser);
student.get("/getTimeSlote/:id", verifyStudentJWT, isStudentPresent, getTherapyTimeSloteForUser);

module.exports = student;