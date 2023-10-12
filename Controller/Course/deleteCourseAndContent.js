const db = require('../../Models');
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;

exports.softDeleteCourseForInstructor = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        await course.destroy();
        res.status(200).send({
            success: true,
            message: "Course deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteCourseForAdmin = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // If this course is not created by admin then some notification should go to admin
        await course.destroy();
        res.status(200).send({
            success: true,
            message: "Course deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteContentForAdmin = async (req, res) => {
    try {
        const courseContent = await CourseContent.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!courseContent) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        if (courseContent.linkOrPath && courseContent.mimeType !== 'video') {
            deleteSingleFile(courseContent.linkOrPath);
        }
        // If this course is not created by admin then some notification should go to admin
        await courseContent.destroy();
        res.status(200).send({
            success: true,
            message: `${courseContent.fieldName} deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteContentForInstructor = async (req, res) => {
    try {
        const courseContent = await CourseContent.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id
            }
        });
        if (!courseContent) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        if (courseContent.linkOrPath && courseContent.mimeType !== 'video') {
            deleteSingleFile(courseContent.linkOrPath);
        }
        await courseContent.destroy();
        res.status(200).send({
            success: true,
            message: `${courseContent.fieldName} deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};