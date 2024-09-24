const express = require("express");
const {
  register,
  login,
  getStudent,
  verifyOTP,
  verifyOTPByLandingPage,
  registerByLandingPage,
  registerByNumber,
  loginByNumber,
  verifyNumberOTP,
  getMyChakra,
  getReferralData,
} = require("../../Controller/User/Student/studentController");
const {
  addUpdateStudentProfile,
  deleteStudentProfile,
} = require("../../Controller/User/Student/studentProfileController");
const homeTutors = require("./homeTutor");
const publice = require("./publicRoute");
const student = express.Router();

// middleware
const { verifyStudentJWT } = require("../../Middleware/verifyJWTToken");
const { isStudentPresent } = require("../../Middleware/isPresent");
const uploadImage = require("../../Middleware/uploadFile/image");

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
student.get("/referralDatas", verifyStudentJWT, getReferralData);

student.post(
  "/addUpdateStudentProfile",
  verifyStudentJWT,
  isStudentPresent,
  uploadImage.single("StudentProfile"),
  addUpdateStudentProfile
);
student.delete(
  "/deleteProfile/:id",
  verifyStudentJWT,
  isStudentPresent,
  deleteStudentProfile
);

student.use(homeTutors);
student.use(publice);

module.exports = student;
