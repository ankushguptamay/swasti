const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;

exports.restoreCourse = async (req, res) => {
    try {
        // Find Course In Database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "This Course is not present in deleted section!"
            });
        }
        // Restore Content
        const content = await CourseContent.findAll({
            where: {
                courseId: req.params.id
            },
            paranoid: false
        });
        if (content.length > 0) {
            for (let i = 0; i < content.length; i++) {
                await content[i].restore();
            }
        }
        // Restore Course
        await course.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreContent = async (req, res) => {
    try {
        // Find Content In Database
        const courseContent = await CourseContent.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!courseContent) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // Restore Content
        await courseContent.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `${courseContent.fieldName} restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};
