const db = require("../../Models");
const { Op } = require("sequelize");
const {
  courseDurationValidation,
} = require("../../Middleware/Validate/validateMaster");
const CourseDuration = db.courseDuration;
const Course_Duration_Type = db.courseDurationType;

exports.createCourseDuration = async (req, res) => {
  try {
    // Validate Body
    const { error } = courseDurationValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    // Check duplicacy
    const { courseDuration } = req.body;
    const isPresent = await CourseDuration.findOne({
      where: {
        courseDuration: courseDuration,
      },
    });
    if (isPresent) {
      return res.status(400).send({
        success: false,
        message: "This course duration is present!",
      });
    }
    // create Course duration
    await CourseDuration.create({
      courseDuration: courseDuration,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course duration created successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllCourseDuration = async (req, res) => {
  try {
    const duration = await CourseDuration.findAll();
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course duration fetched successfully!",
      data: duration,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteCourseDuration = async (req, res) => {
  try {
    // Find In database
    const isPresent = await CourseDuration.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!isPresent) {
      return res.status(400).send({
        success: false,
        message: "This course duration is not present!",
      });
    }
    const findCoures = await Course_Duration_Type.findOne({
      where: { courseDuration: isPresent.courseDuration },
    });
    if (findCoures) {
      return res.status(400).send({
        success: false,
        message: "Course with this duration is present!",
      });
    }
    // delete Course duration
    await isPresent.destroy();
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course duration deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
