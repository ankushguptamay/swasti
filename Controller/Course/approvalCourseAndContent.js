const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;

exports.approveCourse = async (req, res) => {
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
                message: "This Course is not present!"
            });
        }
        // Update Course
        await course.update({
            ...course,
            approvalStatusByAdmin: "Approved"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course approved successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.rejectCourse = async (req, res) => {
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
                message: "This Course is not present!"
            });
        }
        // Update Course
        await course.update({
            ...course,
            approvalStatusByAdmin: "Rejected"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course rejected successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.approveContent = async (req, res) => {
    try {
        // Find Content In Database
        const content = await CourseContent.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "This content is not present!"
            });
        }
        // Update content
        await content.update({
            ...content,
            approvalStatusByAdmin: "Approved"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Content approved successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.rejectContent = async (req, res) => {
    try {
        // Find Content In Database
        const content = await CourseContent.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "This content is not present!"
            });
        }
        // Update content
        await content.update({
            ...content,
            approvalStatusByAdmin: "Rejected"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Content rejected successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.approveCourseFile = async (req, res) => {
    try {
        // Find Course In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "This file is not present!"
            });
        }
        // Update File
        await file.update({
            ...file,
            approvalStatusByAdmin: "Approved"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `${file.fieldName} approved successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.rejectCourseFile = async (req, res) => {
    try {
        // Find Course In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "This file is not present!"
            });
        }
        // Update Course
        await file.update({
            ...file,
            approvalStatusByAdmin: "Rejected"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `${file.fieldName} rejected successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};