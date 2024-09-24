const express = require("express");
const {
  verifyHTPayment,
} = require("../../Controller/HomeTutor/hTBookingController");
const student = express.Router();

student.post("/verifyHTPayment", verifyHTPayment);

module.exports = student;
