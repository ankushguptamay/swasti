const express = require('express');
const { register, login, getAdmin, changePassword } = require('../Controller/Admin/adminController');
const { getAllInstructor, getInstructorForAdmin, registerInstructor, softDeleteInstructor, restoreInstructor,
    verifyInstructor, getAllDeletdInstructor } = require('../Controller/User/Instructor/instructorController');
const { getAllDeletedInstructorProfileById, getAllInstructorProfiles, approveInstructorProfile, rejectInstructorProfile } = require('../Controller/User/Instructor/instructorProfileController');
const { getAllStudent, getStudentForAdmin, registerStudent, softDeleteStudent, restoreStudent,
    verifyStudent, getAllDeletedStudent } = require('../Controller/User/Student/studentController');
const { getAllDeletedStudentProfileById, getAllStudentProfiles, approveStudentProfile, rejectStudentProfile } = require('../Controller/User/Student/studentProfileController');
const { addCourse, addCourseImage, addTeacherImage, addContent, addContentVideo, addContentFile } = require('../Controller/Course/createCourseAndContent');
const { approveContent, approveCourse, rejectContent, rejectCourse, approveCourseFile, rejectCourseFile } = require('../Controller/Course/approvalCourseAndContent');
const { restoreContent, restoreCourse, restoreFile } = require('../Controller/Course/restoreCourseAndContent');
const { getAllApprovedCourse, getCourseByIdForAdmin, getAllPendingCourse, getAllRejectedCourse, getSoftDeletdContentByContentId,
    getAllSoftDeletedCourse, getAllSoftDeletedContentByCourseId } = require('../Controller/Course/getCourseAndContent');
const { softDeleteContentForAdmin, softDeleteCourseForAdmin, hardDeleteContent, hardDeleteCourse, softDeleteFileForAdmin, hardDeleteFile } = require('../Controller/Course/deleteCourseAndContent');
const { createCourseCategory, getAllCourseCategory, deleteCourseCategory } = require('../Controller/Master/courseCategoryController');
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

admin.get("/allDeletedInstructorProfile/:id", verifyAdminJWT, isAdminPresent, getAllDeletedInstructorProfileById);
admin.get("/allInstructorProfiles", verifyAdminJWT, isAdminPresent, getAllInstructorProfiles);
admin.put("/approveInstructorProfile/:id", verifyAdminJWT, isAdminPresent, approveInstructorProfile);
admin.put("/rejectInstructorProfile/:id", verifyAdminJWT, isAdminPresent, rejectInstructorProfile);

// Student
admin.get("/student", verifyAdminJWT, isAdminPresent, getAllStudent);
admin.get("/student/:id", verifyAdminJWT, isAdminPresent, getStudentForAdmin);
admin.get("/deletedStudents", verifyAdminJWT, isAdminPresent, getAllDeletedStudent);
admin.post("/registerStudent", verifyAdminJWT, isAdminPresent, registerStudent);
admin.put("/restoreStudent/:id", verifyAdminJWT, isAdminPresent, restoreStudent);
admin.put("/verifyStudent/:id", verifyAdminJWT, isAdminPresent, verifyStudent);
admin.delete("/softDeleteStudent/:id", verifyAdminJWT, isAdminPresent, softDeleteStudent);

admin.get("/allDeletedStudentProfile/:id", verifyAdminJWT, isAdminPresent, getAllDeletedStudentProfileById);
admin.get("/allStudentProfiles", verifyAdminJWT, isAdminPresent, getAllStudentProfiles);
admin.put("/approveStudentProfile/:id", verifyAdminJWT, isAdminPresent, approveStudentProfile);
admin.put("/rejectStudentProfile/:id", verifyAdminJWT, isAdminPresent, rejectStudentProfile);

// Course And Content
// 1.Add
admin.post("/addCourse", verifyAdminJWT, isAdminPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
admin.post("/addCourseImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.single("CourseImage"), addCourseImage); // courseId
admin.post("/addTeacherImage/:id", verifyAdminJWT, isAdminPresent, uploadImage.single("TeacherImage"), addTeacherImage); // courseId
admin.post("/addContent", verifyAdminJWT, isAdminPresent, addContent); // courseId
admin.post("/addContentFile/:id", verifyAdminJWT, isAdminPresent, uploadImageAndPDF.single("ContentFile"), addContentFile); // contentId
admin.post("/addContentVideo/:id", verifyAdminJWT, isAdminPresent, addContentVideo);
// 2.Get
admin.get("/courses", verifyAdminJWT, isAdminPresent, getAllApprovedCourse); // Approved
admin.get("/courses/:id", verifyAdminJWT, isAdminPresent, getCourseByIdForAdmin);  // courseId
admin.get("/pendingCourses", verifyAdminJWT, isAdminPresent, getAllPendingCourse); // Pending
admin.get("/rejectedCourses", verifyAdminJWT, isAdminPresent, getAllRejectedCourse); // Rejected
admin.get("/softDeletedCourse/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedCourse); // Soft Deleted Course
admin.get("/softDeletedContent/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedContentByCourseId); // Soft Deleted Content
admin.get("/getSoftDeletdContent/:id", verifyAdminJWT, isAdminPresent, getSoftDeletdContentByContentId); // contentId
// 3.Approval
admin.put("/approveCourse/:id", verifyAdminJWT, isAdminPresent, approveCourse);  // courseId
admin.put("/approveContent/:id", verifyAdminJWT, isAdminPresent, approveContent); // contentId
admin.put("/rejectCourse/:id", verifyAdminJWT, isAdminPresent, rejectCourse); // courseId
admin.put("/rejectContent/:id", verifyAdminJWT, isAdminPresent, rejectContent); // contentId
admin.put("/approveCourseFile/:id", verifyAdminJWT, isAdminPresent, approveCourseFile); // fileId
admin.put("/rejectCourseFile/:id", verifyAdminJWT, isAdminPresent, rejectCourseFile); // fileId
// 4.Delete
admin.delete("/softDeleteCourse/:id", verifyAdminJWT, isAdminPresent, softDeleteCourseForAdmin); // courseId
admin.delete("/softDeleteContent/:id", verifyAdminJWT, isAdminPresent, softDeleteContentForAdmin); // contentId
admin.delete("/softDeleteFile/:id", verifyAdminJWT, isAdminPresent, softDeleteFileForAdmin); // fileId
admin.delete("/hardDeleteContent/:id", verifyAdminJWT, isAdminPresent, hardDeleteContent); // contentId
admin.delete("/hardDeleteCourse/:id", verifyAdminJWT, isAdminPresent, hardDeleteCourse); // courseId
admin.delete("/hardDeleteFile/:id", verifyAdminJWT, isAdminPresent, hardDeleteFile); // fileId
// 5.Restore
admin.put("/restoreCourse/:id", verifyAdminJWT, isAdminPresent, restoreCourse); // courseId
admin.put("/restoreContent/:id", verifyAdminJWT, isAdminPresent, restoreContent); // contentId
admin.put("/restoreFile/:id", verifyAdminJWT, isAdminPresent, restoreFile); // fileId

// Master
// 1. CourseCategory
admin.post("/createCourseCategory", verifyAdminJWT, isAdminPresent, createCourseCategory);
admin.get("/courseCategories", verifyAdminJWT, isAdminPresent, getAllCourseCategory);
admin.delete("/deleteCourseCategory/:id", verifyAdminJWT, isAdminPresent, deleteCourseCategory);

module.exports = admin;