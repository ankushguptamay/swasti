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
        const content = await CourseContent.findAll({
            where: {
                courseId: req.params.id,
                deletedAt: { [Op.lte]: course.deletedAt }
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        if (content.length > 0) {
            for (let i = 0; i < content.length; i++) {
                await content[i].restore();
            }
        }
        // Restore File, This will restore file whose delete time is greater and equal to course delete time
        const file = await CourseAndContentFile.findAll({
            where: {
                courseId: req.params.id,
                deletedAt: { [Op.lte]: course.deletedAt }
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        if (file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                await file[i].restore();
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
        // Restore File, This will restore file whose delete time is greater and equal to content delete time
        const file = await CourseAndContentFile.findAll({
            where: {
                contentId: req.params.id,
                deletedAt: { [Op.lte]: courseContent.deletedAt },
                fieldName: "ContentFile"
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        if (file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                await file[i].restore();
            }
        }
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