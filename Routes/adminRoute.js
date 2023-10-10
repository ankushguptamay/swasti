const express = require('express');
const { register, login, getAdmin, changePassword } = require('../Controller/Admin/adminController');
const { getAllInstructor, getInstructorForAdmin, registerInstructor, softDeleteInstructor, restoreInstructor, verifyInstructor } = require('../Controller/User/Instructor/instructorController');
const { getAllStudent, getStudentForAdmin, registerStudent, softDeleteStudent, restoreStudent, verifyStudent } = require('../Controller/User/Student/studentController');
const admin = express.Router();

// middleware
const { verifyAdminJWT } = require('../Middleware/verifyJWTToken');
const { isAdminPresent } = require('../Middleware/isPresent');
const uploadImage = require('../Middleware/uploadFile/singleImage');
const uploadMultiPDF = require('../Middleware/uploadFile/multiPDF');

// Admin
admin.post("/register", register);
admin.post("/login", login);
admin.get("/admin", verifyAdminJWT, isAdminPresent, getAdmin);
admin.put("/changePassword", verifyAdminJWT, isAdminPresent, changePassword);

// Instructor
admin.get("/instructor", verifyAdminJWT, isAdminPresent, getAllInstructor);
admin.get("/instructor/:id", verifyAdminJWT, isAdminPresent, getInstructorForAdmin);
admin.post("/registerInstructor", verifyAdminJWT, isAdminPresent, registerInstructor);
admin.put("/softDeleteInstructor/:id", verifyAdminJWT, isAdminPresent, softDeleteInstructor);
admin.put("/restoreInstructor/:id", verifyAdminJWT, isAdminPresent, restoreInstructor);
admin.put("/verifyInstructor/:id", verifyAdminJWT, isAdminPresent, verifyInstructor);

// Student
admin.get("/student", verifyAdminJWT, isAdminPresent, getAllStudent);
admin.get("/student/:id", verifyAdminJWT, isAdminPresent, getStudentForAdmin);
admin.post("/registerStudent", verifyAdminJWT, isAdminPresent, registerStudent);
admin.put("/softDeleteStudent/:id", verifyAdminJWT, isAdminPresent, softDeleteStudent);
admin.put("/restoreStudent/:id", verifyAdminJWT, isAdminPresent, restoreStudent);
admin.put("/verifyStudent/:id", verifyAdminJWT, isAdminPresent, verifyStudent);

module.exports = admin;