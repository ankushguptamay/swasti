const db = require('../../Models');
const { Op } = require("sequelize");
const { courseTypeValidation } = require('../../Middleware/Validate/validateMaster');
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const CourseType = db.courseType;

exports.createCourseType = async (req, res) => {
    try {
        // Validate Body
        const { error } = courseTypeValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check duplicacy
        const courseType = capitalizeFirstLetter(req.body.courseType);
        const isPresent = await CourseType.findOne({
            where: {
                courseType: courseType
            }
        });
        if (isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This course type is present!'
            });
        }
        // create Course type
        await CourseType.create({
            courseType: courseType
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course type created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllCourseType = async (req, res) => {
    try {
        const type = await CourseType.findAll();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course type fetched successfully!",
            data: type
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteCourseType = async (req, res) => {
    try {
        // Find In database
        const isPresent = await CourseType.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This course type is not present!'
            });
        }
        // delete Course type
        await isPresent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course type deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};