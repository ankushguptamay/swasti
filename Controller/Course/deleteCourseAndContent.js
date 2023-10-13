const db = require('../../Models');
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;

exports.softDeleteCourseForInstructor = async (req, res) => {
    try {
        // Find Course In Database
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
        // Soft Delete Content
        const content = await CourseContent.findAll({
            where: {
                courseId: req.params.id
            }
        });
        if (content.length > 0) {
            for (let i = 0; i < content.length; i++) {
                await content[i].destroy();
            }
        }
        // Soft Delete
        await course.destroy();
        // Final Response
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
        // Find Course In Database
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
        // Soft Delete Content
        const content = await CourseContent.findAll({
            where: {
                courseId: req.params.id
            }
        });
        if (content.length > 0) {
            for (let i = 0; i < content.length; i++) {
                await content[i].destroy();
            }
        }
        // If this course is not created by admin then some notification should go to admin
        // Soft Delete
        await course.destroy();
        // Final Response
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
        // Find Course Content In Database
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
        // If this course is not created by admin then some notification should go to admin
        // Soft Delete
        await courseContent.destroy();
        // Final Response
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
        // Find Course Content In Database
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
        // Soft Delete
        await courseContent.destroy();
        // Final Response
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

exports.hardDeleteCourse = async (req, res) => {
    try {
        // Find Course In Database
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
        // Hard Delete Content
        const content = await CourseContent.findAll({
            where: {
                courseId: req.params.id
            }
        });
        if (content.length > 0) {
            for (let i = 0; i < content.length; i++) {
                // Delete File
                if (content[i].linkOrPath && content[i].mimeType !== 'video') {
                    deleteSingleFile(content[i].linkOrPath);
                }
                await content[i].destroy({
                    force: true
                });
            }
        }
        // Hard Delete Course
        await course.destroy({
            force: true
        });
        // Final Response
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

exports.hardDeleteContent = async (req, res) => {
    try {
        // Find Course Content In Database
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
        // Delete File
        if (courseContent.linkOrPath && courseContent.mimeType !== 'video') {
            deleteSingleFile(courseContent.linkOrPath);
        }
        // If this course is not created by admin then some notification should go to admin
        // Hard Delete
        await courseContent.destroy({
            force: true
        });
        // Final Response
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
