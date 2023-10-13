const express = require('express');
const { register, login, getAdmin, changePassword } = require('../Controller/Admin/adminController');
const { getAllInstructor, getInstructorForAdmin, registerInstructor, softDeleteInstructor, restoreInstructor, verifyInstructor } = require('../Controller/User/Instructor/instructorController');
const { getAllStudent, getStudentForAdmin, registerStudent, softDeleteStudent, restoreStudent, verifyStudent } = require('../Controller/User/Student/studentController');
const { addCourse } = require('../Controller/Course/createCourseAndContent');
const { getAllApprovedCourse, getCourseByIdForAdmin, getAllPendingCourse, getAllRejectedCourse, 
    getAllSoftDeletedCourse, getAllSoftDeletedContentByCourseId} = require('../Controller/Course/getCourseAndContent');
const { softDeleteContentForAdmin, softDeleteCourseForAdmin, hardDeleteContent, hardDeleteCourse } = require('../Controller/Course/deleteCourseAndContent');
const admin = express.Router();

// middleware
const { verifyAdminJWT } = require('../Middleware/verifyJWTToken');
const { isAdminPresent } = require('../Middleware/isPresent');
const uploadImageAndPDF = require('../Middleware/uploadFile/imageAndPDF');
const uploadImage = require('../Middleware/uploadFile/image');

// Admin
admin.post("/register", register);
admin.post("/login", login);
admin.get("/admin", verifyAdminJWT, isAdminPresent, getAdmin);
admin.put("/changePassword", verifyAdminJWT, isAdminPresent, changePassword);

// Instructor
admin.get("/instructor", verifyAdminJWT, isAdminPresent, getAllInstructor);
admin.get("/instructor/:id", verifyAdminJWT, isAdminPresent, getInstructorForAdmin);
admin.post("/registerInstructor", verifyAdminJWT, isAdminPresent, registerInstructor);
admin.delete("/softDeleteInstructor/:id", verifyAdminJWT, isAdminPresent, softDeleteInstructor);
admin.put("/restoreInstructor/:id", verifyAdminJWT, isAdminPresent, restoreInstructor);
admin.put("/verifyInstructor/:id", verifyAdminJWT, isAdminPresent, verifyInstructor);

// Student
admin.get("/student", verifyAdminJWT, isAdminPresent, getAllStudent);
admin.get("/student/:id", verifyAdminJWT, isAdminPresent, getStudentForAdmin);
admin.post("/registerStudent", verifyAdminJWT, isAdminPresent, registerStudent);
admin.delete("/softDeleteStudent/:id", verifyAdminJWT, isAdminPresent, softDeleteStudent);
admin.put("/restoreStudent/:id", verifyAdminJWT, isAdminPresent, restoreStudent);
admin.put("/verifyStudent/:id", verifyAdminJWT, isAdminPresent, verifyStudent);

// Course
admin.post("/addCourse", verifyAdminJWT, isAdminPresent, uploadImage.fields([{ name: 'CourseImage', maxCount: 1 }, { name: 'TeacherImage', maxCount: 1 }]), addCourse);
admin.get("/courses", verifyAdminJWT, isAdminPresent, getAllApprovedCourse); // Approved
admin.get("/courses/:id", verifyAdminJWT, isAdminPresent, getCourseByIdForAdmin);
admin.get("/pendingCourses", verifyAdminJWT, isAdminPresent, getAllPendingCourse); // Pending
admin.get("/rejectedCourses", verifyAdminJWT, isAdminPresent, getAllRejectedCourse); // Rejected
admin.get("/softDeletedCourse/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedCourse); // Soft Deleted Course
admin.get("/softDeletedContent/:id", verifyAdminJWT, isAdminPresent, getAllSoftDeletedContentByCourseId); // Soft Deleted Content
admin.delete("/softDeleteCourse/:id", verifyAdminJWT, isAdminPresent, softDeleteCourseForAdmin);
admin.delete("/softDeleteContent/:id", verifyAdminJWT, isAdminPresent, softDeleteContentForAdmin);
admin.delete("/hardDeleteContent/:id", verifyAdminJWT, isAdminPresent, hardDeleteContent);
admin.delete("/hardDeleteCourse/:id", verifyAdminJWT, isAdminPresent, hardDeleteCourse);

module.exports = admin;