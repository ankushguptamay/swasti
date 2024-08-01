const db = require("../../Models");
const { Op } = require("sequelize");
const {
  courseDurationTypeValidation,
} = require("../../Middleware/Validate/validateMaster");
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const Course_Duration_Type = db.courseDurationType;

exports.createCourseDurationType = async (req, res) => {
  try {
    // Validate Body
    const { error } = courseDurationTypeValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    // Check duplicacy
    const { courseDuration, courseType, universityId } = req.body;
    const courseName = capitalizeFirstLetter(req.body.courseName);
    const isPresent = await Course_Duration_Type.findOne({
      where: {
        courseName: courseName,
        universityId: universityId,
      },
    });
    if (isPresent) {
      return res.status(400).send({
        success: false,
        message: "This course is present!",
      });
    }
    // create Course duration type relation
    await Course_Duration_Type.create({
      courseDuration: courseDuration,
      courseType: courseType,
      courseName: courseName,
      universityId: universityId,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course duration type relationed successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllCourseDurationType = async (req, res) => {
  try {
    const relation = await Course_Duration_Type.findAll();
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course relation fetched successfully!",
      data: relation,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteCourseDurationType = async (req, res) => {
  try {
    // Find In database
    const isPresent = await Course_Duration_Type.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!isPresent) {
      return res.status(400).send({
        success: false,
        message: "This course duration type is not present!",
      });
    }
    // delete Course duration
    await isPresent.destroy();
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course relation deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllCourseByType = async (req, res) => {
  try {
    const type = req.params.type;
    const relation = await Course_Duration_Type.findAll({
      where: { courseType: type },
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course relation fetched successfully!",
      data: relation,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllCourseByUniversityId = async (req, res) => {
  try {
    const universityId = req.params.id;
    const course = await Course_Duration_Type.findAll({
      where: { universityId: universityId },
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Course fetched successfully!",
      data: course,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
