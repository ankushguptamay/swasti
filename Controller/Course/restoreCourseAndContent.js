const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;

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
                message: "This Course is not present in delete section!"
            });
        }
        // Restore Content, This will restore content whose delete time is greater and equal to course delete time
        await CourseContent.restore({
            where: {
                courseId: req.params.id,
                deletedAt: { [Op.lte]: course.deletedAt }
            },
            paranoid: false
        });
        // Restore File, This will restore file whose delete time is greater and equal to course delete time
        await CourseAndContentFile.restore({
            where: {
                courseId: req.params.id,
                deletedAt: { [Op.lte]: course.deletedAt }
            },
            paranoid: false
        });
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
        // Restore File, This will restore file whose delete time is greater and equal to content delete time
        const file = await CourseAndContentFile.restore({
            where: {
                contentId: req.params.id,
                deletedAt: { [Op.lte]: courseContent.deletedAt },
                fieldName: "ContentFile"
            },
            paranoid: false
        });

        // Restore Content
        await courseContent.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Content restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreFile = async (req, res) => {
    try {
        // Find Content In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // Restore File
        await file.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Content restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};