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
        if (course.deletedThrough === "Instructor" || course.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This Course is not deleted by Swastee!",
            });
        }
        await course.update({ deletedThrough: null });
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
        if (courseContent.deletedThrough === "Instructor" || courseContent.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This Content is not deleted by Swastee!",
            });
        }
        await courseContent.update({ deletedThrough: null });
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
        if (file.deletedThrough === "Instructor" || file.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This File is not deleted by Swastee!",
            });
        }
        await file.update({ deletedThrough: null });
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