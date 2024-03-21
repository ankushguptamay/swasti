const db = require('../../Models');
const { Op } = require("sequelize");
const { changeQualificationStatus, changePublish } = require("../../Middleware/Validate/validateInstructor");
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

exports.changeCoursePublish = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePublish(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPublish } = req.body;
        // Change message
        let message = "unpublish";
        if (isPublish === true) {
            message === "publish";
        }
        let createrId;
        if (req.instructor) {
            createrId = req.instructor.id;
        } else if (req.admin) {
            createrId = req.admin.id;
        } else {
            return res.status(400).send({
                success: false,
                message: `You can not ${message} this course!`
            });
        }
        // Find Course In Database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                createrId: createrId
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "This Course is not present!"
            });
        }
        if (course.approvalStatusByAdmin === "Approved") {
            // Update Course
            await course.update({
                ...course,
                isPublish: isPublish
            });
            // Final Response
            res.status(200).send({
                success: true,
                message: `Course ${message} successfully!`
            });
        } else {
            // Final Response
            res.status(400).send({
                success: false,
                message: `This course is not approved!`
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeContentPublish = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePublish(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPublish } = req.body;
        // Change message
        let message = "unpublish";
        if (isPublish === true) {
            message === "publish";
        }
        let createrId;
        if (req.instructor) {
            createrId = req.instructor.id;
        } else if (req.admin) {
            createrId = req.admin.id;
        } else {
            return res.status(400).send({
                success: false,
                message: `You can not ${message} this content!`
            });
        }
        // Find Content In Database
        const content = await CourseContent.findOne({
            where: {
                id: req.params.id,
                createrId: createrId
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "This content is not present!"
            });
        }
        if (content.approvalStatusByAdmin === "Approved") {
            // Update content
            await content.update({
                ...content,
                isPublish: isPublish
            });
            // Final Response
            res.status(200).send({
                success: true,
                message: `Content ${message} successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `This content is not approved!`
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeCourseFilePublish = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePublish(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPublish } = req.body;
        // Change message
        let message = "unpublish";
        if (isPublish === true) {
            message === "publish";
        }
        let createrId;
        if (req.instructor) {
            createrId = req.instructor.id;
        } else if (req.admin) {
            createrId = req.admin.id;
        } else {
            return res.status(400).send({
                success: false,
                message: `You can not ${message} this file!`
            });
        }
        // Find Course In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id,
                createrId: createrId
            }
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "This file is not present!"
            });
        }
        if (file.approvalStatusByAdmin === "Approved") {
            // Update file
            await file.update({
                ...file,
                isPublish: isPublish
            });
            // Final Response
            res.status(200).send({
                success: true,
                message: `File ${message} successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `This file is not approved!`
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};