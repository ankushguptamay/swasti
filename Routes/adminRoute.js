const express = require('express');
const { register, login, getAdmin, changePassword } = require('../Controller/Admin/adminController');
const { getAllInstructor, getInstructorForAdmin, registerInstructor, softDeleteInstructor, restoreInstructor,
    verifyInstructor, getAllDeletdInstructor } = require('../Controller/User/Instructor/instructorController');
const { getAllStudent, getStudentForAdmin, registerStudent, softDeleteStudent, restoreStudent,
    verifyStudent, getAllDeletedStudent } = require('../Controller/User/Student/studentController');
const { addCourse, addCourseImage, addTeacherImage, addContent, addContentVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { approveContent, approveCourse, rejectContent, rejectCourse } = require('../Controller/Course/approvalCourseAndContent');
const { getAllApprovedCourse, getCourseByIdForAdmin, getAllPendingCourse, getAllRejectedCourse, getSoftDeletdContentByContentId,
    getAllSoftDeletedCourse, getAllSoftDeletedContentByCourseId } = require('../Controller/Course/getCourseAndContent');
const { softDeleteContentForAdmin, softDeleteCourseForAdmin, hardDeleteContent, hardDeleteCourse } = require('../Controller/Course/deleteCourseAndContent');
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

// Instructor
admin.get("/instructor", verifyAdminJWT, isAdminPresent, getAllInstructor);
admin.get("/instructor/:id", verifyAdminJWT, isAdminPresent, getInstructorForAdmin);
admin.get("/deletedInstructors", verifyAdminJWT, isAdminPresent, getAllDeletdInstructor);
admin.post("/registerInstructor", verifyAdminJWT, isAdminPresent, registerInstructor);
admin.put("/restoreInstructor/:id", verifyAdminJWT, isAdminPresent, restoreInstructor);
admin.put("/verifyInstructor/:id", verifyAdminJWT, isAdminPresent, verifyInstructor);
admin.delete("/softDeleteInstructor/:id", verifyAdminJWT, isAdminPresent, softDeleteInstructor);

// Student
admin.get("/student", verifyAdminJWT, isAdminPresent, getAllStudent);
admin.get("/student/:id", verifyAdminJWT, isAdminPresent, getStudentForAdmin);
admin.get("/deletedStudents", verifyAdminJWT, isAdminPresent, getAllDeletedStudent);
admin.post("/registerStudent", verifyAdminJWT, isAdminPresent, registerStudent);
admin.put("/restoreStudent/:id", verifyAdminJWT, isAdminPresent, restoreStudent);
admin.put("/verifyStudent/:id", verifyAdminJWT, isAdminPresent, verifyStudent);
admin.delete("/softDeleteStudent/:id", verifyAdminJWT, isAdminPresent, softDeleteStudent);

// Course And Content
admin.post("/addCourse", verifyAdminJWT, isAdminPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
admin.post("/addCourseImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.single("CourseImage"), addCourseImage); // courseId
admin.post("/addTeacherImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
admin.post("/addContent", verifyAdminJWT, isAdminPresent, addContent); // courseId
admin.post("/addContentFile/:id", verifyAdminJWT, isAdminPresent, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
admin.post("/addContentVideo/:id", verifyAdminJWT, isAdminPresent, addContentVideo);
admin.get("/courses", verifyAdminJWT, isAdminPresent, getAllApprovedCourse); // Approved
admin.get("/courses/:id", verifyAdminJWT, isAdminPresent, getCourseByIdForAdmin);  // courseId
admin.get("/pendingCourses", verifyAdminJWT, isAdminPresent, getAllPendingCourse); // Pending
admin.get("/rejectedCourses", verifyAdminJWT, isAdminPresent, getAllRejectedCourse); // Rejected
admin.get("/softDeletedCourse/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedCourse); // Soft Deleted Course
admin.get("/softDeletedContent/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedContentByCourseId); // Soft Deleted Content
admin.get("/getSoftDeletdContent/:id", verifyAdminJWT, isAdminPresent, getSoftDeletdContentByContentId); // contentId
admin.put("/approveCourse/:id", verifyAdminJWT, isAdminPresent, approveCourse);  // courseId
admin.put("/approveContent/:id", verifyAdminJWT, isAdminPresent, approveContent); // contentId
admin.put("/rejectCourse/:id", verifyAdminJWT, isAdminPresent, rejectCourse); // courseId
admin.put("/rejectContent/:id", verifyAdminJWT, isAdminPresent, rejectContent); // contentId
admin.delete("/softDeleteCourse/:id", verifyAdminJWT, isAdminPresent, softDeleteCourseForAdmin); // courseId
admin.delete("/softDeleteContent/:id", verifyAdminJWT, isAdminPresent, softDeleteContentForAdmin); // contentId
admin.delete("/hardDeleteContent/:id", verifyAdminJWT, isAdminPresent, hardDeleteContent); // contentId
admin.delete("/hardDeleteCourse/:id", verifyAdminJWT, isAdminPresent, hardDeleteCourse); // courseId

module.exports = admin;