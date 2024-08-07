const db = require("../Models");
const Admin = db.admin;
const Instructor = db.instructor;
const Student = db.student;
const { Op } = require("sequelize");

exports.isAdminPresent = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({
      where: {
        [Op.and]: [{ id: req.admin.id }, { email: req.admin.email }],
      },
    });
    if (!admin) {
      return res.send({
        message: "Admin is not present! Are you register?.. ",
      });
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.isInstructorForCourse = async (req, res, next) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.send({
        message: "Instructor is not present! Are you register?.. ",
      });
    }
    if (
      instructor.name &&
      instructor.email &&
      instructor.phoneNumber &&
      instructor.imageFileName &&
      instructor.languages &&
      instructor.bio &&
      instructor.location &&
      instructor.dateOfBirth
    ) {
      if (instructor.instructorTermAccepted === true) {
        req.instructorCode = instructor.instructorCode;
        req.instructor = { ...req.instructor, name: instructor.name };
        next();
      } else {
        return res.status(400).json({
          success: false,
          message: "Please accept term and condition for course!",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile!",
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.isInstructorForHomeTutor = async (req, res, next) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.send({
        message: "Instructor is not present! Are you register?.. ",
      });
    }
    if (
      instructor.name &&
      instructor.email &&
      instructor.phoneNumber &&
      instructor.imageFileName &&
      instructor.languages &&
      instructor.bio &&
      instructor.location &&
      instructor.dateOfBirth
    ) {
      if (instructor.homeTutorTermAccepted === true) {
        req.instructorCode = instructor.instructorCode;
        req.instructor = { ...req.instructor, name: instructor.name };
        next();
      } else {
        return res.status(400).json({
          success: false,
          message: "Please accept term and condition for Home Tutor!",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile!",
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.isInstructorForTherapist = async (req, res, next) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.send({
        message: "Instructor is not present! Are you register?.. ",
      });
    }
    if (
      instructor.name &&
      instructor.email &&
      instructor.phoneNumber &&
      instructor.imageFileName &&
      instructor.languages &&
      instructor.bio &&
      instructor.location &&
      instructor.dateOfBirth
    ) {
      if (instructor.therapistTermAccepted === true) {
        req.instructorCode = instructor.instructorCode;
        req.instructor = { ...req.instructor, name: instructor.name };
        next();
      } else {
        return res.status(400).json({
          success: false,
          message: "Please accept term and condition for Therapist!",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile!",
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.isInstructorForYogaStudio = async (req, res, next) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.send({
        message: "Instructor is not present! Are you register?.. ",
      });
    }
    if (
      instructor.name &&
      instructor.email &&
      instructor.phoneNumber &&
      instructor.imageFileName &&
      instructor.languages &&
      instructor.bio &&
      instructor.location &&
      instructor.dateOfBirth
    ) {
      if (instructor.yogaStudioTermAccepted === true) {
        req.instructorCode = instructor.instructorCode;
        req.instructor = { ...req.instructor, name: instructor.name };
        next();
      } else {
        return res.status(400).json({
          success: false,
          message: "Please accept term and condition for Yoga Studio!",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile!",
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.isInstructorProfileComplete = async (req, res, next) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.send({
        message: "Instructor is not present! Are you register?.. ",
      });
    }
    if (
      instructor.name &&
      instructor.email &&
      instructor.phoneNumber &&
      instructor.imageFileName &&
      instructor.languages &&
      instructor.bio &&
      instructor.location &&
      instructor.dateOfBirth
    ) {
      req.instructorCode = instructor.instructorCode;
      next();
    } else {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile!",
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.isStudentPresent = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      where: {
        [Op.and]: [
          { id: req.student.id },
          { email: req.student.email },
          { phoneNumber: req.student.phoneNumber },
        ],
      },
    });
    if (!student) {
      return res.send({
        message: "Student is not present! Are you register?.. ",
      });
    }
    req.studentName = student.name;
    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
