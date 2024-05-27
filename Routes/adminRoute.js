const express = require('express');
const { register, login, getAdmin, changePassword } = require('../Controller/Admin/adminController');
const { getAllInstructor, getInstructorForAdmin, registerInstructor, softDeleteInstructor, restoreInstructor, getAllSoftDeletedInstructor } = require('../Controller/User/Instructor/instructorController');
const { changeQualificationStatus, softDeleteQualificationAdmin, restoreQualificationAdmin, getQualificationById, getSoftDeletedQualification } = require('../Controller/User/Instructor/instructorQualificationController');
const { softDeleteExperienceAdmin, restoreExperienceAdmin, getExperienceById, getSoftDeletedExperience } = require('../Controller/User/Instructor/instructorExperienceController');
const { getAllStudent, getStudentForAdmin, registerStudent, softDeleteStudent, restoreStudent, getAllDeletedStudent, hardDeleteStudent, heartAPI } = require('../Controller/User/Student/studentController');
const { deleteStudentProfile } = require('../Controller/User/Student/studentProfileController');
const { addCourse, addCourseImage, addTeacherImage, addContent, addContentVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { changeContentStatus, changeCourseFileStatus, changeCourseStatus, changeContentPublish, changeCoursePublish, changeCourseFilePublish } = require('../Controller/Course/approvalCourseAndContent');
const { restoreContent, restoreCourse, restoreFile } = require('../Controller/Course/restoreCourseAndContent');
const { getAllCourse, getCourseByIdForAdmin, getSoftDeletdContentByContentId, getFileByContentId,
    getAllSoftDeletedCourse, getAllSoftDeletedContentByCourseId } = require('../Controller/Course/getCourseAndContent');
const { studentToCourse } = require('../Controller/Course/updateCourseAndContent');
const { deleteInstructorReview, getInstructorAverageRating, getInstructorReview } = require('../Controller/Review/instructorReviewController');
const { softDeleteContentForAdmin, softDeleteCourseForAdmin, hardDeleteContent, hardDeleteCourse, softDeleteFileForAdmin, hardDeleteFile } = require('../Controller/Course/deleteCourseAndContent');
const { createCourseCategory, getAllCourseCategory, deleteCourseCategory } = require('../Controller/Master/courseCategoryController');
const { createCourseDuration, getAllCourseDuration, deleteCourseDuration } = require('../Controller/Master/courseDurationController');
const { createCourseType, getAllCourseType, deleteCourseType } = require('../Controller/Master/courseTypeController');
const { createUniversity_Institute, getAllUniversity_Institute, deleteUniversity_Institute } = require('../Controller/Master/university_instituteController');
const { createCoupon, getAllCouponForAdmin, softDeleteCoupon, restoreCoupon, changeCouponStatus, getAllSoftDeletedCoupon, getCouponById,
    getCouponToCourse, addCouponToCourse, applyCouponToCourse } = require('../Controller/Master/couponController');
const { getCourseAverageRating, getCourseReview, deleteCourseReview } = require('../Controller/Review/courseReviewController');
const { createNotificationForAdmin, getNotificationForAdmin, changeNotificationStatus } = require('../Controller/createNotificationCont');
const { totalCourse, totalDraftedCourse, totalPendingCourse, totalPublishedCourse, totalVerifiedCourse, totalStudent, getContentAndFile,
    totalInstructor, totalPendingInstructor, totalVerifiedInstructor } = require('../Controller/Admin/dashboardController');
const { getPaymentDetailsForAdmin } = require('../Controller/User/Student/purchaseCourseController');
const { sendCampaignEmail, addCampaignEmailCredentials } = require('../Controller/campaignEmailController');
const { createYogaStudioBusiness, getMyYogaStudio, getYogaStudioByIdAdmin, updateYogaStudioBusinessForAdmin, changeYogaStudioBusinessStatus, getYogaStudioForAdmin,
    restoreYogaStudioBusiness, softDeleteYogaStudioBusiness, hardDeleteYogaStudioBusiness } = require('../Controller/YogaStudio/businessController');
const { createYogaStudioContact, updateYogaStudioContactForAdmin, changeYogaStudioContactStatus, restoreYogaStudioContact, softDeleteYogaStudioContact, hardDeleteYogaStudioContact } = require('../Controller/YogaStudio/contactController');
const { createYogaStudioImage, changeYogaStudioImageStatus, restoreYogaStudioImage, softDeleteYogaStudioImage, hardDeleteYogaStudioImage } = require('../Controller/YogaStudio/imageController');
const { createYogaStudioTiming, updateYogaStudioTimeForAdmin, changeYogaStudioTimeStatus, restoreYogaStudioTime, softDeleteYogaStudioTime, hardDeleteYogaStudioTime } = require('../Controller/YogaStudio/timingController');
const admin = express.Router();

// middleware
const { verifyAdminJWT } = require('../Middleware/verifyJWTToken');
const { isAdminPresent } = require('../Middleware/isPresent');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadPDF = require('../Middleware/uploadFile/pdf');

// Admin
admin.post("/register", register);
admin.post("/login", login);
admin.get("/admin", verifyAdminJWT, isAdminPresent, getAdmin);
admin.put("/changePassword", verifyAdminJWT, isAdminPresent, changePassword);

admin.get("/heartAPI", heartAPI);

// Instructor Bio
admin.get("/instructor", verifyAdminJWT, isAdminPresent, getAllInstructor);
admin.get("/instructor/:id", verifyAdminJWT, isAdminPresent, getInstructorForAdmin);
admin.get("/softDeletedInstructors", verifyAdminJWT, isAdminPresent, getAllSoftDeletedInstructor);
admin.post("/registerInstructor", verifyAdminJWT, isAdminPresent, registerInstructor);
admin.put("/restoreInstructor/:id", verifyAdminJWT, isAdminPresent, restoreInstructor);
admin.delete("/softDeleteInstructor/:id", verifyAdminJWT, isAdminPresent, softDeleteInstructor);

// Instructor Qualification
admin.get("/softDeletedQualification/:id", verifyAdminJWT, isAdminPresent, getSoftDeletedQualification); // id :instructorId
admin.get("/qualification/:id", verifyAdminJWT, isAdminPresent, getQualificationById);
admin.put("/changeQualificationStatus/:id", verifyAdminJWT, isAdminPresent, changeQualificationStatus);
admin.delete("/softDeleteQualification/:id", verifyAdminJWT, isAdminPresent, softDeleteQualificationAdmin);
admin.put("/restoreQualification/:id", verifyAdminJWT, isAdminPresent, restoreQualificationAdmin);

// Instructor Experience
admin.get("/softDeletedExperience/:id", verifyAdminJWT, isAdminPresent, getSoftDeletedExperience); // id :instructorId
admin.get("/experience/:id", verifyAdminJWT, isAdminPresent, getExperienceById);
admin.put("/restoreExperienceAdmin/:id", verifyAdminJWT, isAdminPresent, restoreExperienceAdmin);
admin.delete("/softDeleteExperienceAdmin/:id", verifyAdminJWT, isAdminPresent, softDeleteExperienceAdmin);

// Student
admin.get("/student", verifyAdminJWT, isAdminPresent, getAllStudent);
admin.get("/student/:id", verifyAdminJWT, isAdminPresent, getStudentForAdmin);
admin.get("/deletedStudents", verifyAdminJWT, isAdminPresent, getAllDeletedStudent);
admin.post("/registerStudent", verifyAdminJWT, isAdminPresent, registerStudent);
admin.put("/restoreStudent/:id", verifyAdminJWT, isAdminPresent, restoreStudent)
admin.delete("/softDeleteStudent/:id", verifyAdminJWT, isAdminPresent, softDeleteStudent);
admin.delete("/hardDeleteStudent/:id", verifyAdminJWT, isAdminPresent, hardDeleteStudent);

admin.delete("/deleteStudentProfile/:id", verifyAdminJWT, isAdminPresent, deleteStudentProfile);

// Course And Content
// 1. Add
admin.post("/addCourse", verifyAdminJWT, isAdminPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
admin.post("/addCourseImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.single("CourseImage"), addCourseImage); // courseId
admin.post("/addTeacherImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
admin.post("/addContent", verifyAdminJWT, isAdminPresent, addContent); // courseId
admin.post("/addContentFile/:id", verifyAdminJWT, isAdminPresent, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
admin.post("/addContentVideo/:id", verifyAdminJWT, isAdminPresent, addContentVideo); // contentId
// 2. Get
admin.get("/courses", verifyAdminJWT, isAdminPresent, getAllCourse);
admin.get("/courses/:id", verifyAdminJWT, isAdminPresent, getCourseByIdForAdmin);  // courseId
admin.get("/softDeletedCourse", verifyAdminJWT, isAdminPresent, getAllSoftDeletedCourse); // Soft Deleted Course
admin.get("/softDeletedContent/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedContentByCourseId); // Soft Deleted Content courseId
admin.get("/getSoftDeletdContent/:id", verifyAdminJWT, isAdminPresent, getSoftDeletdContentByContentId); // contentId
admin.get("/files/:id", verifyAdminJWT, isAdminPresent, getFileByContentId);  // contentId
// 3. Approval
admin.put("/changeCourseStatus/:id", verifyAdminJWT, isAdminPresent, changeCourseStatus);  // courseId
admin.put("/changeContentStatus/:id", verifyAdminJWT, isAdminPresent, changeContentStatus); // contentId
admin.put("/changeCourseFileStatus/:id", verifyAdminJWT, isAdminPresent, changeCourseFileStatus); // fileId
admin.put("/coursePublish/:id", verifyAdminJWT, isAdminPresent, changeCoursePublish);  // courseId
admin.put("/contentPublish/:id", verifyAdminJWT, isAdminPresent, changeContentPublish); // contentId
admin.put("/filePublish/:id", verifyAdminJWT, isAdminPresent, changeCourseFilePublish); // fileId
// 4. Delete
admin.delete("/softDeleteCourse/:id", verifyAdminJWT, isAdminPresent, softDeleteCourseForAdmin); // courseId
admin.delete("/softDeleteContent/:id", verifyAdminJWT, isAdminPresent, softDeleteContentForAdmin); // contentId
admin.delete("/softDeleteFile/:id", verifyAdminJWT, isAdminPresent, softDeleteFileForAdmin); // fileId
// admin.delete("/hardDeleteContent/:id", verifyAdminJWT, isAdminPresent, hardDeleteContent); // contentId
// admin.delete("/hardDeleteCourse/:id", verifyAdminJWT, isAdminPresent, hardDeleteCourse); // courseId
// admin.delete("/hardDeleteFile/:id", verifyAdminJWT, isAdminPresent, hardDeleteFile); // fileId
// 5. Restore
admin.put("/restoreCourse/:id", verifyAdminJWT, isAdminPresent, restoreCourse); // courseId
admin.put("/restoreContent/:id", verifyAdminJWT, isAdminPresent, restoreContent); // contentId
admin.put("/restoreFile/:id", verifyAdminJWT, isAdminPresent, restoreFile); // fileId
// 6. Update
admin.put("/addCouponToCourse/:id", verifyAdminJWT, isAdminPresent, addCouponToCourse); // courseId

// Master
// 1. CourseCategory
admin.post("/createCourseCategory", verifyAdminJWT, isAdminPresent, createCourseCategory);
admin.get("/courseCategories", verifyAdminJWT, isAdminPresent, getAllCourseCategory);
admin.delete("/deleteCourseCategory/:id", verifyAdminJWT, isAdminPresent, deleteCourseCategory);
// 2. Coupon
admin.post("/createCoupon", verifyAdminJWT, isAdminPresent, createCoupon);
admin.get("/coupon", verifyAdminJWT, isAdminPresent, getAllCouponForAdmin);
admin.get("/deletedCoupons", verifyAdminJWT, isAdminPresent, getAllSoftDeletedCoupon);
admin.get("/coupon/:id", verifyAdminJWT, isAdminPresent, getCouponById);
admin.delete("/softDeleteCoupon/:id", verifyAdminJWT, isAdminPresent, softDeleteCoupon);
admin.put("/restoreCoupon/:id", verifyAdminJWT, isAdminPresent, restoreCoupon);
admin.put("/changeCouponStatus/:id", verifyAdminJWT, isAdminPresent, changeCouponStatus);
admin.get("/couponToCourse/:id", verifyAdminJWT, isAdminPresent, getCouponToCourse);
admin.put("/applyCouponToCourse", verifyAdminJWT, isAdminPresent, applyCouponToCourse);
// 1. CourseDuration
admin.post("/createCourseDuration", verifyAdminJWT, isAdminPresent, createCourseDuration);
admin.get("/courseDurations", verifyAdminJWT, isAdminPresent, getAllCourseDuration);
admin.delete("/deleteCourseDuration/:id", verifyAdminJWT, isAdminPresent, deleteCourseDuration);
// 1. CourseType
admin.post("/createCourseType", verifyAdminJWT, isAdminPresent, createCourseType);
admin.get("/courseTypes", verifyAdminJWT, isAdminPresent, getAllCourseType);
admin.delete("/deleteCourseType/:id", verifyAdminJWT, isAdminPresent, deleteCourseType);
// 1. University_Institute
admin.post("/university_institute", verifyAdminJWT, isAdminPresent, createUniversity_Institute);
admin.get("/university_institutes", verifyAdminJWT, isAdminPresent, getAllUniversity_Institute);
admin.delete("/university_institute/:id", verifyAdminJWT, isAdminPresent, deleteUniversity_Institute);

// Review
// 1. Instructor Review
admin.get("/getInstructorReview/:id", verifyAdminJWT, isAdminPresent, getInstructorReview); //id = instructorId
admin.get("/getInstructorAverageRating/:id", verifyAdminJWT, isAdminPresent, getInstructorAverageRating);  //id = instructorId
admin.delete("/deleteInstructorReview/:id", verifyAdminJWT, isAdminPresent, deleteInstructorReview); //id = review Id
// 2. Course Review
admin.get("/getCourseReview/:id", verifyAdminJWT, isAdminPresent, getCourseReview); //id = courseId
admin.get("/getCourseAverageRating/:id", verifyAdminJWT, isAdminPresent, getCourseAverageRating);  //id = courseId
// admin.delete("/deleteCourseReview/:id", verifyAdminJWT, isAdminPresent, deleteCourseReview); //id = review Id

// Notification
admin.post("/createNotification", verifyAdminJWT, isAdminPresent, createNotificationForAdmin);
admin.get("/notifications", verifyAdminJWT, isAdminPresent, getNotificationForAdmin);
admin.put("/changeNotificationStatus/:id", verifyAdminJWT, isAdminPresent, changeNotificationStatus);  // notificationId

// Danger
admin.post("/studentToCourse/:id", verifyAdminJWT, isAdminPresent, studentToCourse);  //id = courseId

// Dashboard
admin.get("/getContentAndFile/:id", verifyAdminJWT, isAdminPresent, getContentAndFile);  //id = courseId
admin.get("/totalCourse", verifyAdminJWT, isAdminPresent, totalCourse); // all course , except drafted course
admin.get("/totalDraftedCourse", verifyAdminJWT, isAdminPresent, totalDraftedCourse); // course created by instructor but not submit for approval
admin.get("/totalPendingCourse", verifyAdminJWT, isAdminPresent, totalPendingCourse); // submited by instructor for approval
admin.get("/totalPublishedCourse", verifyAdminJWT, isAdminPresent, totalPublishedCourse); // user can see this courses 
admin.get("/totalVerifiedCourse", verifyAdminJWT, isAdminPresent, totalVerifiedCourse); // approved by swasti, user can see if courses is published
admin.get("/totalStudent", verifyAdminJWT, isAdminPresent, totalStudent);
admin.get("/totalInstructor", verifyAdminJWT, isAdminPresent, totalInstructor);
admin.get("/totalPendingInstructor", verifyAdminJWT, isAdminPresent, totalPendingInstructor);
admin.get("/totalVerifiedInstructor", verifyAdminJWT, isAdminPresent, totalVerifiedInstructor);

// Payment 
admin.get("/paymentDetails", verifyAdminJWT, isAdminPresent, getPaymentDetailsForAdmin);

// Payment 
admin.post("/sendCampaignEmail", sendCampaignEmail);
admin.post("/addCampaignEmailCredentials", addCampaignEmailCredentials);


// YogaStudio
admin.post("/createYogaStudioBusiness", verifyAdminJWT, isAdminPresent, createYogaStudioBusiness);
admin.post("/createYogaStudioContact/:id", verifyAdminJWT, isAdminPresent, createYogaStudioContact);
admin.post("/createYogaStudioImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.array('studioImages', 10), createYogaStudioImage);
admin.post("/createYogaStudioTiming/:id", verifyAdminJWT, isAdminPresent, createYogaStudioTiming);

admin.get("/myYogaStudios", verifyAdminJWT, isAdminPresent, getMyYogaStudio);
admin.get("/yogaStudios", verifyAdminJWT, isAdminPresent, getYogaStudioForAdmin);
admin.get("/yogaStudios/:id", verifyAdminJWT, isAdminPresent, getYogaStudioByIdAdmin);

admin.put("/updateYogaStudioBusiness/:id", verifyAdminJWT, isAdminPresent, updateYogaStudioBusinessForAdmin);
admin.put("/updateYogaStudioContact/:id", verifyAdminJWT, isAdminPresent, updateYogaStudioContactForAdmin);
admin.put("/updateYogaStudioTime/:id", verifyAdminJWT, isAdminPresent, updateYogaStudioTimeForAdmin);

admin.put("/changeYogaStudioBusiness/:id", verifyAdminJWT, isAdminPresent, changeYogaStudioBusinessStatus);
admin.put("/changeYogaStudioContact/:id", verifyAdminJWT, isAdminPresent, changeYogaStudioContactStatus);
admin.put("/changeYogaStudioImage/:id", verifyAdminJWT, isAdminPresent, changeYogaStudioImageStatus);
admin.put("/changeYogaStudioTime/:id", verifyAdminJWT, isAdminPresent, changeYogaStudioTimeStatus);

admin.put("/restoreYSBusiness/:id", verifyAdminJWT, isAdminPresent, restoreYogaStudioBusiness);
admin.put("/restoreYSContact/:id", verifyAdminJWT, isAdminPresent, restoreYogaStudioContact);
admin.put("/restoreYSImage/:id", verifyAdminJWT, isAdminPresent, restoreYogaStudioImage);
admin.put("/restoreYSTime/:id", verifyAdminJWT, isAdminPresent, restoreYogaStudioTime);

admin.delete("/softDeleteYSBusiness/:id", verifyAdminJWT, isAdminPresent, softDeleteYogaStudioBusiness);
admin.delete("/softDeleteYSContact/:id", verifyAdminJWT, isAdminPresent, softDeleteYogaStudioContact);
admin.delete("/softDeleteYSImage/:id", verifyAdminJWT, isAdminPresent, softDeleteYogaStudioImage);
admin.delete("/softDeleteYSTime/:id", verifyAdminJWT, isAdminPresent, softDeleteYogaStudioTime);

admin.delete("/hardDeleteYSBusiness/:id", verifyAdminJWT, isAdminPresent, hardDeleteYogaStudioBusiness);
admin.delete("/hardDeleteYSContact/:id", verifyAdminJWT, isAdminPresent, hardDeleteYogaStudioContact);
admin.delete("/hardDeleteYSImage/:id", verifyAdminJWT, isAdminPresent, hardDeleteYogaStudioImage);
admin.delete("/hardDeleteYSTime/:id", verifyAdminJWT, isAdminPresent, hardDeleteYogaStudioTime);

module.exports = admin;