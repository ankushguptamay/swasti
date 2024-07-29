const db = require("../../Models");
const { Op } = require("sequelize");
const {
  university_instituteValidation,
} = require("../../Middleware/Validate/validateMaster");
const University_Institute = db.university_institute;
const Course_Duration_Type = db.courseDurationType;
const CourseDuration = db.courseDuration;
const CourseType = db.courseType;
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");

exports.createUniversity_Institute = async (req, res) => {
  try {
    // Validate Body
    const { error } = university_instituteValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { institute_collage } = req.body;
    // Check duplicacy
    const university_name = capitalizeFirstLetter(req.body.university_name);
    const isPresent = await University_Institute.findOne({
      where: {
        university_name: university_name,
        institute_collage: institute_collage,
      },
    });
    if (isPresent) {
      return res.status(400).send({
        success: false,
        message: "This university/institute name is present!",
      });
    }
    // create university_institute_name
    await University_Institute.create({
      university_institute_name: university_institute_name,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "University/Institute name created successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllUniversity_Institute = async (req, res) => {
  try {
    const university_institute = await University_Institute.findAll();
    // Final Response
    res.status(200).send({
      success: true,
      message: "University/Institute fetched successfully!",
      data: university_institute,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteUniversity_Institute = async (req, res) => {
  try {
    // Find In database
    const isPresent = await University_Institute.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!isPresent) {
      return res.status(400).send({
        success: false,
        message: "This University/Institute is not present!",
      });
    }
    // Delete course
    await Course_Duration_Type.destroy({
      where: { universityId: req.params.id },
    });
    // delete university_institute
    await isPresent.destroy();
    // Final Response
    res.status(200).send({
      success: true,
      message: "University/Institute deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.bulkCreateUniversity_Institute = async (req, res) => {
  try {
    const records = req.body.records;
    const trans = records.map(
      ({
        university,
        institute_collage,
        courseName,
        courseDuration,
        courseType,
      }) => {
        return {
          university: university.replace(/\s+/g, " ").trim(),
          institute_collage: institute_collage.replace(/\s+/g, " ").trim(),
          courseName: courseName.trim(),
          courseDuration: courseDuration.replace(/\s+/g, " ").trim(),
          courseType: courseType.replace(/\s+/g, " ").trim(),
        };
      }
    );
    for (let i = 0; i < trans.length; i++) {
      // Create University
      let isPresent = await University_Institute.findOne({
        where: {
          university_name: trans[i].university,
          institute_collage: trans[i].institute_collage,
        },
      });
      if (!isPresent) {
        isPresent = await University_Institute.create({
          university_name: trans[i].university,
          institute_collage: trans[i].institute_collage,
        });
      }
      // Create course duration
      let isPresentDuration = await CourseDuration.findOne({
        where: {
          courseDuration: trans[i].courseDuration,
        },
      });
      if (!isPresentDuration) {
        await CourseDuration.create({
          courseDuration: trans[i].courseDuration,
        });
      }
      // Create course tyre
      let isPresentType = await CourseType.findOne({
        where: {
          courseType: trans[i].courseType,
        },
      });
      if (!isPresentType) {
        await CourseType.create({
          courseType: trans[i].courseType,
        });
      }
      await Course_Duration_Type.create({
        courseName: trans[i].courseName,
        courseDuration: trans[i].courseDuration,
        courseType: trans[i].courseType,
        universityId: isPresent.id,
      });
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: "University/Institute name created successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
