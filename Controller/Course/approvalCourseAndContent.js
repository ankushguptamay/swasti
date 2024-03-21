const db = require('../../Models');
const { Op } = require("sequelize");
const { changeQualificationStatus } = require("../../Middleware/Validate/validateInstructor");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;

exports.changeCourseStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
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
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Course ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeContentStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
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
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Content ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeCourseFileStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
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
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `${file.fieldName} ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};