const express = require('express');
const { register, login, getInstructor, verifyOTP, updateInstructor, registerByNumber, loginByNumber, verifyNumberOTP, instructorTerm, getMyChakra,
    therapistTerm, homeTutorTerm, yogaStudioTerm } = require('../Controller/User/Instructor/instructorController');
const { addQualification, updateQualification, deleteQualificationInstructor, getQualificationById, getMyQualificationByqualificationIn } = require('../Controller/User/Instructor/instructorQualificationController');
const { addExperience, updateExperiencen, deleteExperienceInstructor, getExperienceById } = require('../Controller/User/Instructor/instructorExperienceController');
const { deleteInstructorReview, getInstructorAverageRating, getInstructorReview } = require('../Controller/Review/instructorReviewController');
const { changeContentPublish, changeCoursePublish, changeCourseFilePublish, changeVideoPublish, submitContentForApproval, submitCourseForApproval, submitFileForApproval, submitVideoForApproval } = require('../Controller/Course/approvalCourseAndContent');
const { addCourse, addCourseImage, addTeacherImage, addContent, addRecordedVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { getAllCourse, getCourseByIdForInstructor, getFileByContentId, getVideoByContentId } = require('../Controller/Course/getCourseAndContent');
const { softDeleteContent, softDeleteCourse, softDeleteFile, softDeleteVideo } = require('../Controller/Course/deleteCourseAndContent');
const { getAllCourseCategory } = require('../Controller/Master/courseCategoryController');
const { getAllCourseDuration } = require('../Controller/Master/courseDurationController');
const { getAllCourseType } = require('../Controller/Master/courseTypeController');
const { getAllTherapySpecilization } = require('../Controller/Master/therapySecilizationController');
const { getAllUniversity_Institute } = require('../Controller/Master/university_instituteController');
const { getAllTherapyType } = require('../Controller/Master/therapyTypeController');
const { getAllHTSpecilization } = require('../Controller/Master/hTSpecilizationController');
const { updateContentForInstructor, updateCourseForInstructor } = require('../Controller/Course/updateCourseAndContent');
const { totalCourse, totalDraftedCourse, totalOngoingCourse, getContentAndFile, totalStudent } = require('../Controller/User/Instructor/dashboardController');
const { createCoupon, softDeleteCoupon, getAllInstructorCoupon, getCouponById, addCouponToCourse, getCouponToCourse, applyCouponToCourse } = require('../Controller/Master/couponController');
const { getCourseAverageRating, getCourseReview, deleteCourseReview } = require('../Controller/Review/courseReviewController');
const { createNotificationForInstructor, getMyNotificationForInstructor, getNotificationForInstructor } = require('../Controller/createNotificationCont');
const { getPaymentDetailsForInstructor } = require('../Controller/User/Student/purchaseCourseController');
const { createYogaStudioBusiness, createYogaStudioContact, createYogaStudioImage, createYogaStudioTiming } = require('../Controller/YogaStudio/createBusinessController');
const { getMyYogaStudioForInstructor, getYogaStudioById } = require('../Controller/YogaStudio/getBusinessController');
const { softDeleteYogaStudioBusiness, softDeleteYogaStudioContact, softDeleteYogaStudioImage, softDeleteYogaStudioTime } = require('../Controller/YogaStudio/deleteBusinessController');
const { submitYSContactForApproval, submitYSImageForApproval, submitYSTimeForApproval, submitYogaStudioForApproval, publishYogaStudio } = require('../Controller/YogaStudio/approveBusinessController');
const { updateYogaStudioBusiness, updateYogaStudioContact, updateYogaStudioTime } = require('../Controller/YogaStudio/updateBusinessController');
const { getAllCourseByType } = require('../Controller/Master/courseDurationTypeController');
const { createHomeTutor, addHTutorSeviceArea, addHTutorTimeSlote, addHTutorImage } = require('../Controller/HomeTutor/createHomeTutorController');
const { getMyHomeTutorForInstructor, getHomeTutorById, getHTTimeSlote, getServiceNotification } = require('../Controller/HomeTutor/getHomeTutorController');
const { publishHomeTutor, changeHTTimeSloteStatus, viewServiceNotifications } = require('../Controller/HomeTutor/approveHomeTutorController');
const { softDeleteHTutorImage, softDeleteHTutorServiceArea, softDeleteHTutorTimeSlote, softDeleteHomeTutor } = require('../Controller/HomeTutor/deleteHomeTutorController');
const { updateHomeTutor } = require('../Controller/HomeTutor/updateHomeTutorController');
const { createTherapy, addTherapyImage, addTherapySeviceArea, addTherapyTimeSlote, addTherapyTypeOffered } = require('../Controller/Therapy/createTherapyController');
const { getMyTherapyForInstructor, getTherapyById } = require('../Controller/Therapy/getTherapyController');
const { giveYSReview, getYSAverageRating, getYSReview, softDeleteYSReview, updateYSReview } = require('../Controller/Review/ySReviewController');
const { getMyHTBookedSloteForInstructor } = require('../Controller/HomeTutor/hTBookingController');
const { getHTAverageRating, getHTReview, updateHTReview, softDeleteHTReview } = require('../Controller/Review/hTReviewController');
const instructor = express.Router();

// middleware
const { verifyInstructorJWT } = require('../Middleware/verifyJWTToken');
const { isInstructorForCourse, isInstructorProfileComplete, isInstructorForHomeTutor, isInstructorForTherapist, isInstructorForYogaStudio } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/image');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');
const uploadPDF = require('../Middleware/uploadFile/pdf');

// BIO
instructor.post("/register", register);
instructor.post("/login", login);
instructor.post("/verifyOTP", verifyOTP);
instructor.post("/registerByNumber", registerByNumber);
instructor.post("/loginByNumber", loginByNumber);
instructor.post("/verifyNumberOTP", verifyNumberOTP);
instructor.get("/instructor", verifyInstructorJWT, getInstructor);
instructor.get("/chakras", verifyInstructorJWT, getMyChakra);
instructor.put("/updateInstructor", verifyInstructorJWT, uploadImage.single("profileImage"), updateInstructor);

// Term and condition
instructor.put("/instructorTerm", verifyInstructorJWT, instructorTerm);
instructor.put("/therapistTerm", verifyInstructorJWT, therapistTerm);
instructor.put("/homeTutorTerm", verifyInstructorJWT, homeTutorTerm);
instructor.put("/yogaStudioTerm", verifyInstructorJWT, yogaStudioTerm);

// Qualification
instructor.get("/qualification/:id", verifyInstructorJWT, isInstructorProfileComplete, getQualificationById);
instructor.post("/addQualification", verifyInstructorJWT, isInstructorProfileComplete, uploadImageAndPDF.single("qualificationFile"), addQualification);
instructor.put("/updateQualification/:id", verifyInstructorJWT, isInstructorProfileComplete, uploadImageAndPDF.single("qualificationFile"), updateQualification);
instructor.delete("/deleteQualification/:id", verifyInstructorJWT, isInstructorProfileComplete, deleteQualificationInstructor);
instructor.get("/qualificationIn/:qualificationIn", verifyInstructorJWT, isInstructorProfileComplete, getMyQualificationByqualificationIn);

// Experience
instructor.post("/addExperience", verifyInstructorJWT, isInstructorProfileComplete, addExperience);
instructor.get("/experience/:id", verifyInstructorJWT, isInstructorProfileComplete, getExperienceById);
instructor.put("/updateExperiencen/:id", verifyInstructorJWT, isInstructorProfileComplete, updateExperiencen);
instructor.delete("/deleteExperienceInstructor/:id", verifyInstructorJWT, isInstructorProfileComplete, deleteExperienceInstructor);

// Course And Content
// 1. Add
instructor.post("/addCourse", verifyInstructorJWT, isInstructorForCourse, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
instructor.post("/addCourseImage/:id", verifyInstructorJWT, isInstructorForCourse, uploadImage.single("CourseImage"), addCourseImage); // courseId
instructor.post("/addTeacherImage/:id", verifyInstructorJWT, isInstructorForCourse, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
instructor.post("/addContent", verifyInstructorJWT, isInstructorForCourse, addContent); // courseId
instructor.post("/addContentFile/:id", verifyInstructorJWT, isInstructorForCourse, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
instructor.post("/addRecordedVideo/:id", verifyInstructorJWT, isInstructorForCourse, addRecordedVideo); // contentId

// 2. Get
instructor.get("/courses", verifyInstructorJWT, isInstructorForCourse, getAllCourse);
instructor.get("/courses/:id", verifyInstructorJWT, isInstructorForCourse, getCourseByIdForInstructor);
instructor.get("/files/:id", verifyInstructorJWT, isInstructorForCourse, getFileByContentId); // id:contentId
instructor.get("/videos/:id", verifyInstructorJWT, isInstructorForCourse, getVideoByContentId); // id:contentId

// 3. Publish
instructor.put("/coursePublish/:id", verifyInstructorJWT, isInstructorForCourse, changeCoursePublish);  // courseId
instructor.put("/contentPublish/:id", verifyInstructorJWT, isInstructorForCourse, changeContentPublish); // contentId
instructor.put("/filePublish/:id", verifyInstructorJWT, isInstructorForCourse, changeCourseFilePublish); // fileId
instructor.put("/videoPublish/:id", verifyInstructorJWT, isInstructorForCourse, changeVideoPublish); // videoId

instructor.put("/submitContentForApproval/:id", verifyInstructorJWT, isInstructorForCourse, submitContentForApproval);  // contentId
instructor.put("/submitCourseForApproval/:id", verifyInstructorJWT, isInstructorForCourse, submitCourseForApproval); // courseId
instructor.put("/submitFileForApproval/:id", verifyInstructorJWT, isInstructorForCourse, submitFileForApproval); // fileId
instructor.put("/submitVideoForApproval/:id", verifyInstructorJWT, isInstructorForCourse, submitVideoForApproval); // videoId

// 3. Delete
instructor.delete("/softDeleteCourse/:id", verifyInstructorJWT, isInstructorForCourse, softDeleteCourse);
instructor.delete("/softDeleteContent/:id", verifyInstructorJWT, isInstructorForCourse, softDeleteContent);
instructor.delete("/softDeleteFile/:id", verifyInstructorJWT, isInstructorForCourse, softDeleteFile);
instructor.delete("/softDeleteVideo/:id", verifyInstructorJWT, isInstructorForCourse, softDeleteVideo);

// 4. Update
instructor.put("/addCouponToCourse/:id", verifyInstructorJWT, isInstructorForCourse, addCouponToCourse); // courseId
instructor.put("/updateContent/:id", verifyInstructorJWT, isInstructorForCourse, updateContentForInstructor); // contentId
instructor.put("/updateCourse/:id", verifyInstructorJWT, isInstructorForCourse, updateCourseForInstructor); // courseId

// Master
instructor.get("/coursecategories", verifyInstructorJWT, isInstructorProfileComplete, getAllCourseCategory);
instructor.get("/courseDurations", verifyInstructorJWT, isInstructorProfileComplete, getAllCourseDuration);
instructor.get("/courseTypes", verifyInstructorJWT, isInstructorProfileComplete, getAllCourseType);
instructor.get("/university_institutes", verifyInstructorJWT, isInstructorProfileComplete, getAllUniversity_Institute);
instructor.get("/courseDurationTypes/:type", verifyInstructorJWT, isInstructorProfileComplete, getAllCourseByType);
instructor.get("/therapySpecilizations", verifyInstructorJWT, isInstructorProfileComplete, getAllTherapySpecilization);
instructor.get("/therapyTypes", verifyInstructorJWT, isInstructorProfileComplete, getAllTherapyType);
instructor.get("/hTSpecilizations", verifyInstructorJWT, isInstructorProfileComplete, getAllHTSpecilization);

// 2. Coupon
instructor.post("/createCoupon", verifyInstructorJWT, isInstructorProfileComplete, createCoupon);
instructor.delete("/softDeleteCoupon/:id", verifyInstructorJWT, isInstructorProfileComplete, softDeleteCoupon);
instructor.get("/coupons", verifyInstructorJWT, isInstructorProfileComplete, getAllInstructorCoupon);
instructor.get("/coupons/:id", verifyInstructorJWT, isInstructorProfileComplete, getCouponById);
instructor.get("/couponToCourse/:id", verifyInstructorJWT, isInstructorProfileComplete, getCouponToCourse);
instructor.put("/applyCouponToCourse", verifyInstructorJWT, isInstructorProfileComplete, applyCouponToCourse);

// Review
// 1. Instructor Review
instructor.get("/getInstructorAverageRating", verifyInstructorJWT, isInstructorProfileComplete, getInstructorAverageRating);
instructor.get("/getInstructorReview", verifyInstructorJWT, isInstructorProfileComplete, getInstructorReview);
instructor.delete("/deleteInstructorReview/:id", verifyInstructorJWT, isInstructorProfileComplete, deleteInstructorReview); //id = review Id

// 2. Course Review
instructor.get("/getCourseReview/:id", verifyInstructorJWT, isInstructorForCourse, getCourseReview); // id = courseId
instructor.get("/getCourseAverageRating/:id", verifyInstructorJWT, isInstructorForCourse, getCourseAverageRating); // id = courseId
// instructor.delete("/deleteCourseReview/:id", verifyInstructorJWT, isInstructorForCourse, deleteCourseReview); //id = review Id

// 3. Yoga Studio Review
instructor.get("/ySReview/:id", verifyInstructorJWT, isInstructorForYogaStudio, getYSReview); //id = businessId
instructor.get("/ySAverageRating/:id", verifyInstructorJWT, isInstructorForYogaStudio, getYSAverageRating);//id = businessId
instructor.post("/giveYSReview/:id", verifyInstructorJWT, isInstructorForYogaStudio, giveYSReview);//id = businessId
instructor.delete("/deleteYSReview/:id", verifyInstructorJWT, isInstructorForYogaStudio, softDeleteYSReview); //id = review Id
instructor.delete("/updateYSReview/:id", verifyInstructorJWT, isInstructorForYogaStudio, updateYSReview); //id = review Id

// 4. Home Tutor Review
instructor.get("/hTReview/:id", verifyInstructorJWT, isInstructorForHomeTutor, getHTReview); //id = homeTutorId
instructor.get("/hTAverageRating/:id", verifyInstructorJWT, isInstructorForHomeTutor, getHTAverageRating);//id = homeTutorId
instructor.delete("/deleteHTReview/:id", verifyInstructorJWT, isInstructorForHomeTutor, softDeleteHTReview); //id = review Id
instructor.delete("/updateHTReview/:id", verifyInstructorJWT, isInstructorForHomeTutor, updateHTReview); //id = review Id

// Dashboard
instructor.get("/totalCourse", verifyInstructorJWT, isInstructorProfileComplete, totalCourse);
instructor.get("/totalDraftedCourse", verifyInstructorJWT, isInstructorProfileComplete, totalDraftedCourse);
instructor.get("/totalOngoingCourse", verifyInstructorJWT, isInstructorProfileComplete, totalOngoingCourse);
instructor.get("/getContentAndFile/:id", verifyInstructorJWT, isInstructorProfileComplete, getContentAndFile); // courseId
instructor.get("/totalStudent", verifyInstructorJWT, isInstructorProfileComplete, totalStudent);

// Notification
instructor.post("/createNotification", verifyInstructorJWT, isInstructorProfileComplete, createNotificationForInstructor);
instructor.get("/myNotifications", verifyInstructorJWT, isInstructorProfileComplete, getMyNotificationForInstructor);
instructor.get("/notifications", verifyInstructorJWT, isInstructorProfileComplete, getNotificationForInstructor);

// Payment
instructor.get("/paymentDetails", verifyInstructorJWT, isInstructorProfileComplete, getPaymentDetailsForInstructor);

// YogaStudio
instructor.post("/createYogaStudioBusiness", verifyInstructorJWT, isInstructorForYogaStudio, createYogaStudioBusiness);
instructor.post("/createYogaStudioContact/:id", verifyInstructorJWT, isInstructorForYogaStudio, createYogaStudioContact);
instructor.post("/createYogaStudioImage/:id", verifyInstructorJWT, isInstructorForYogaStudio, uploadImage.array('studioImages', 10), createYogaStudioImage);
instructor.post("/createYogaStudioTiming/:id", verifyInstructorJWT, isInstructorForYogaStudio, createYogaStudioTiming);

instructor.get("/myYogaStudios", verifyInstructorJWT, isInstructorForYogaStudio, getMyYogaStudioForInstructor);
instructor.get("/yogaStudios/:id", verifyInstructorJWT, isInstructorForYogaStudio, getYogaStudioById);

instructor.put("/submitYogaStudio/:id", verifyInstructorJWT, isInstructorForYogaStudio, submitYogaStudioForApproval);
instructor.put("/submitYSContact/:id", verifyInstructorJWT, isInstructorForYogaStudio, submitYSContactForApproval);
instructor.put("/submitYSImage/:id", verifyInstructorJWT, isInstructorForYogaStudio, submitYSImageForApproval);
instructor.put("/submitYSTime/:id", verifyInstructorJWT, isInstructorForYogaStudio, submitYSTimeForApproval);

instructor.put("/publishYogaStudio/:id", verifyInstructorJWT, isInstructorForYogaStudio, publishYogaStudio);

instructor.put("/updateYogaStudioBusiness/:id", verifyInstructorJWT, isInstructorForYogaStudio, updateYogaStudioBusiness);
instructor.put("/updateYogaStudioContact/:id", verifyInstructorJWT, isInstructorForYogaStudio, updateYogaStudioContact);
instructor.put("/updateYogaStudioTime/:id", verifyInstructorJWT, isInstructorForYogaStudio, updateYogaStudioTime);

instructor.delete("/deleteYSBusiness/:id", verifyInstructorJWT, isInstructorForYogaStudio, softDeleteYogaStudioBusiness);
instructor.delete("/deleteYSContact/:id", verifyInstructorJWT, isInstructorForYogaStudio, softDeleteYogaStudioContact);
instructor.delete("/deleteYSImage/:id", verifyInstructorJWT, isInstructorForYogaStudio, softDeleteYogaStudioImage);
instructor.delete("/deleteYSTime/:id", verifyInstructorJWT, isInstructorForYogaStudio, softDeleteYogaStudioTime);

// Home Tutor
instructor.post("/createHomeTutor", verifyInstructorJWT, isInstructorForHomeTutor, createHomeTutor);
instructor.post("/addHTutorSeviceArea/:id", verifyInstructorJWT, isInstructorForHomeTutor, addHTutorSeviceArea);
instructor.post("/addHTutorTimeSlote/:id", verifyInstructorJWT, isInstructorForHomeTutor, addHTutorTimeSlote);
instructor.post("/addHTutorImage/:id", verifyInstructorJWT, isInstructorForHomeTutor, uploadImage.array('hTutorImages', 3), addHTutorImage);

instructor.get("/homeTutors", verifyInstructorJWT, isInstructorForHomeTutor, getMyHomeTutorForInstructor);
instructor.get("/homeTutors/:id", verifyInstructorJWT, isInstructorForHomeTutor, getHomeTutorById);
instructor.get("/hTTimeSlote/:id", verifyInstructorJWT, isInstructorForHomeTutor, getHTTimeSlote);

instructor.get("/serviceNotifications", verifyInstructorJWT, isInstructorForHomeTutor, getServiceNotification);
instructor.put("/viewServiceNotifications", verifyInstructorJWT, isInstructorForHomeTutor, viewServiceNotifications);

instructor.get("/myHTBookedSlotes", verifyInstructorJWT, isInstructorForHomeTutor, getMyHTBookedSloteForInstructor);

instructor.put("/publishHomeTutor/:id", verifyInstructorJWT, isInstructorForHomeTutor, publishHomeTutor);
instructor.put("/changeHTTimeSloteStatus/:id", verifyInstructorJWT, isInstructorForHomeTutor, changeHTTimeSloteStatus);

instructor.put("/updateHomeTutor/:id", verifyInstructorJWT, isInstructorForHomeTutor, updateHomeTutor);

instructor.delete("/deleteHTutorImage/:id", verifyInstructorJWT, isInstructorForHomeTutor, softDeleteHTutorImage);
instructor.delete("/deleteHTutorServiceArea/:id", verifyInstructorJWT, isInstructorForHomeTutor, softDeleteHTutorServiceArea);
instructor.delete("/deleteHTutorTimeSlote/:id", verifyInstructorJWT, isInstructorForHomeTutor, softDeleteHTutorTimeSlote);
instructor.delete("/deleteHomeTutor/:id", verifyInstructorJWT, isInstructorForHomeTutor, softDeleteHomeTutor);

// Therapy
instructor.post("/createTherapy", verifyInstructorJWT, isInstructorForTherapist, createTherapy);
instructor.post("/addTherapySeviceArea/:id", verifyInstructorJWT, isInstructorForTherapist, addTherapySeviceArea);
instructor.post("/addTherapyTimeSlote/:id", verifyInstructorJWT, isInstructorForTherapist, addTherapyTimeSlote);
instructor.post("/addTherapyImage/:id", verifyInstructorJWT, isInstructorForTherapist, uploadImage.array('therapyImages', 3), addTherapyImage);
instructor.post("/addTherapyTypeOffered/:id", verifyInstructorJWT, isInstructorForTherapist, addTherapyTypeOffered);

instructor.get("/therapies", verifyInstructorJWT, isInstructorForTherapist, getMyTherapyForInstructor);
instructor.get("/therapies/:id", verifyInstructorJWT, isInstructorForTherapist, getTherapyById);

module.exports = instructor;