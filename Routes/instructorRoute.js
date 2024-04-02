const express = require('express');
const { register, login, getInstructor, verifyOTP, updateInstructor } = require('../Controller/User/Instructor/instructorController');
const { addQualification, updateQualification, deleteQualificationInstructor, getQualificationById } = require('../Controller/User/Instructor/instructorQualificationController');
const { addExperience, updateExperiencen, deleteExperienceInstructor, getExperienceById } = require('../Controller/User/Instructor/instructorExperienceController');
const { deleteInstructorReview, getInstructorAverageRating, getInstructorReview } = require('../Controller/Review/instructorReviewController');
const { changeContentPublish, changeCoursePublish, changeCourseFilePublish, submitContentForApproval, submitCourseForApproval, submitFileForApproval } = require('../Controller/Course/approvalCourseAndContent');
const { addCourse, addCourseImage, addTeacherImage, addContent, addContentVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { getAllCourse, getCourseByIdForInstructor, getFileByContentId } = require('../Controller/Course/getCourseAndContent');
const { softDeleteContentForInstructor, softDeleteCourseForInstructor, softDeleteFileForInstructor } = require('../Controller/Course/deleteCourseAndContent');
const { getAllCourseCategory } = require('../Controller/Master/courseCategoryController');
const { } = require('../Controller/Course/updateCourseAndContent');
const { totalCourse, totalDraftedCourse, totalOngoingCourse, getContentAndFile } = require('../Controller/User/Instructor/dashboardController');
const { createCoupon, softDeleteCoupon, getAllInstructorCoupon, getCouponById, addCouponToCourse, getCouponToCourse } = require('../Controller/Master/couponController');
const { getCourseAverageRating, getCourseReview, deleteCourseReview } = require('../Controller/Review/courseReviewController');
const { createNotificationForInstructor, getMyNotificationForInstructor, getNotificationForInstructor } = require('../Controller/createNotificationCont');
const instructor = express.Router();

// middleware
const { verifyInstructorJWT } = require('../Middleware/verifyJWTToken');
const { isInstructorPresent, isInstructorProfileComplete } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');
const uploadPDF = require('../Middleware/uploadFile/pdf');

// BIO
instructor.post("/register", register);
instructor.post("/login", login);
instructor.post("/verifyOTP", verifyOTP);
instructor.get("/instructor", verifyInstructorJWT, getInstructor);
instructor.put("/updateInstructor", verifyInstructorJWT, uploadImage.single("profileImage"), updateInstructor);

// Qualification
instructor.get("/qualification/:id", verifyInstructorJWT, isInstructorProfileComplete, getQualificationById);
instructor.post("/addQualification", verifyInstructorJWT, isInstructorProfileComplete, uploadImageAndPDF.single("qualificationFile"), addQualification);
instructor.put("/updateQualification/:id", verifyInstructorJWT, isInstructorProfileComplete, uploadImageAndPDF.single("qualificationFile"), updateQualification);
instructor.delete("/deleteQualification/:id", verifyInstructorJWT, isInstructorProfileComplete, deleteQualificationInstructor);

// Experience
instructor.post("/addExperience", verifyInstructorJWT, isInstructorProfileComplete, addExperience);
instructor.get("/experience/:id", verifyInstructorJWT, isInstructorProfileComplete, getExperienceById);
instructor.put("/updateExperiencen/:id", verifyInstructorJWT, isInstructorProfileComplete, updateExperiencen);
instructor.delete("/deleteExperienceInstructor/:id", verifyInstructorJWT, isInstructorProfileComplete, deleteExperienceInstructor);

// Course And Content
// 1. Add
instructor.post("/addCourse", verifyInstructorJWT, isInstructorPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
instructor.post("/addCourseImage/:id", verifyInstructorJWT, isInstructorPresent, uploadImage.single("CourseImage"), addCourseImage); // courseId
instructor.post("/addTeacherImage/:id", verifyInstructorJWT, isInstructorPresent, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
instructor.post("/addContent", verifyInstructorJWT, isInstructorPresent, addContent); // courseId
instructor.post("/addContentFile/:id", verifyInstructorJWT, isInstructorPresent, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
instructor.post("/addContentVideo/:id", verifyInstructorJWT, isInstructorPresent, addContentVideo); // contentId

// 2. Get
instructor.get("/courses", verifyInstructorJWT, isInstructorPresent, getAllCourse);
instructor.get("/courses/:id", verifyInstructorJWT, isInstructorPresent, getCourseByIdForInstructor);
instructor.get("/files/:id", verifyInstructorJWT, isInstructorPresent, getFileByContentId); // id:contentId

// 3. Publish
instructor.put("/coursePublish/:id", verifyInstructorJWT, isInstructorPresent, changeCoursePublish);  // courseId
instructor.put("/contentPublish/:id", verifyInstructorJWT, isInstructorPresent, changeContentPublish); // contentId
instructor.put("/filePublish/:id", verifyInstructorJWT, isInstructorPresent, changeCourseFilePublish); // fileId
instructor.put("/submitContentForApproval/:id", verifyInstructorJWT, isInstructorPresent, submitContentForApproval);  // contentId
instructor.put("/submitCourseForApproval/:id", verifyInstructorJWT, isInstructorPresent, submitCourseForApproval); // courseId
instructor.put("/submitFileForApproval/:id", verifyInstructorJWT, isInstructorPresent, submitFileForApproval); // fileId

// 3. Delete
instructor.delete("/softDeleteCourse/:id", verifyInstructorJWT, isInstructorPresent, softDeleteCourseForInstructor);
instructor.delete("/softDeleteContent/:id", verifyInstructorJWT, isInstructorPresent, softDeleteContentForInstructor);
instructor.delete("/softDeleteFile/:id", verifyInstructorJWT, isInstructorPresent, softDeleteFileForInstructor);

// 4. Update
instructor.put("/addCouponToCourse/:id", verifyInstructorJWT, isInstructorPresent, addCouponToCourse); // courseId

// Master
// 1. Coursecategory
instructor.get("/coursecategories", verifyInstructorJWT, isInstructorPresent, getAllCourseCategory);

// 2. Coupon
instructor.post("/createCoupon", verifyInstructorJWT, isInstructorPresent, createCoupon);
instructor.delete("/softDeleteCoupon/:id", verifyInstructorJWT, isInstructorPresent, softDeleteCoupon);
instructor.get("/coupons", verifyInstructorJWT, isInstructorPresent, getAllInstructorCoupon);
instructor.get("/coupons/:id", verifyInstructorJWT, isInstructorPresent, getCouponById);
instructor.get("/couponToCourse/:id", verifyInstructorJWT, isInstructorPresent, getCouponToCourse);

// Review
// 1. Instructor Review
instructor.get("/getInstructorAverageRating", verifyInstructorJWT, isInstructorPresent, getInstructorAverageRating);
instructor.get("/getInstructorReview", verifyInstructorJWT, isInstructorPresent, getInstructorReview);
instructor.delete("/deleteInstructorReview/:id", verifyInstructorJWT, isInstructorPresent, deleteInstructorReview); //id = review Id

// 2. Course Review
instructor.get("/getCourseReview/:id", verifyInstructorJWT, isInstructorPresent, getCourseReview); // id = courseId
instructor.get("/getCourseAverageRating/:id", verifyInstructorJWT, isInstructorPresent, getCourseAverageRating); // id = courseId
instructor.delete("/deleteCourseReview/:id", verifyInstructorJWT, isInstructorPresent, deleteCourseReview); //id = review Id

// Dashboard
instructor.get("/totalCourse", verifyInstructorJWT, isInstructorPresent, totalCourse);
instructor.get("/totalDraftedCourse", verifyInstructorJWT, isInstructorPresent, totalDraftedCourse);
instructor.get("/totalOngoingCourse", verifyInstructorJWT, isInstructorPresent, totalOngoingCourse);
instructor.get("/getContentAndFile/:id", verifyInstructorJWT, isInstructorPresent, getContentAndFile); // courseId

// Notification
instructor.post("/createNotification", verifyInstructorJWT, isInstructorPresent, createNotificationForInstructor);
instructor.get("/myNotifications", verifyInstructorJWT, isInstructorPresent, getMyNotificationForInstructor);
instructor.get("/notifications", verifyInstructorJWT, isInstructorPresent, getNotificationForInstructor);

module.exports = instructor;