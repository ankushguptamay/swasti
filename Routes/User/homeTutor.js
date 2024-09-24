const express = require("express");
const {
  getHomeTutorForUser,
  getHomeTutorByIdForUser,
  getNearestHomeTutorForUser,
  getHTTimeSloteForUser,
} = require("../../Controller/HomeTutor/getHomeTutorController");
const {
  createHTOrder,
  getMyHTBookedSloteForUser,
} = require("../../Controller/HomeTutor/hTBookingController");
const {
  giveHTReviewForUser,
  getHTAverageRating,
  getHTReview,
  updateHTReview,
  softDeleteHTReview,
} = require("../../Controller/Review/hTReviewController");
const student = express.Router();

// middleware
const { verifyStudentJWT } = require("../../Middleware/verifyJWTToken");
const { isStudentPresent } = require("../../Middleware/isPresent");

student.use(verifyStudentJWT);
student.use(isStudentPresent);

// Home Tutor
student.get("/homeTutors", getHomeTutorForUser);
student.get("/homeTutors/:id", getHomeTutorByIdForUser);
student.get("/nearestHomeTutors", getNearestHomeTutorForUser);
student.get("/getTimeSlote/:id", getHTTimeSloteForUser);

student.get("/myHTBookedSlotes", getMyHTBookedSloteForUser);
student.post("/createHTOrder", createHTOrder);

// Home Tutor Review
student.post("/giveHTReview/:id", giveHTReviewForUser); //id = homeTutorId
student.get("/hTAverageRating/:id", getHTAverageRating); //id = homeTutorId
student.get("/hTReview/:id", getHTReview); //id = homeTutorId
student.delete("/deleteHTReview/:id", softDeleteHTReview); //id = review Id
student.put("/updateHTReview/:id", updateHTReview); //id = review Id

module.exports = student;
