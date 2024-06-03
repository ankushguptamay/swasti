const db = require('../../Models');
const { Op } = require("sequelize");
const { changeQualificationStatus, changePublish } = require("../../Middleware/Validate/validateInstructor");
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const CourseUpdateHistory = db.courseHistory;
const ContentUpdateHistory = db.contentHistory;
const Video = db.videos;

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

exports.changeVideoStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find Course In Database
        const video = await Video.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!video) {
            return res.status(400).send({
                success: false,
                message: "This video is not present!"
            });
        }
        // Update video
        await video.update({
            ...video,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Video ${approvalStatusByAdmin} successfully!`
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
            message = "publish";
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
        let message = "Unpublish";
        if (isPublish === true) {
            message = "Publish";
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
        let message = "Unpublish";
        if (isPublish === true) {
            message = "Publish";
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

exports.changeVideoPublish = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePublish(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPublish } = req.body;
        // Change message
        let message = "Unpublish";
        if (isPublish === true) {
            message = "Publish";
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
        // Find Video In Database
        const video = await Video.findOne({
            where: {
                id: req.params.id,
                createrId: createrId
            }
        });
        if (!video) {
            return res.status(400).send({
                success: false,
                message: "This video is not present!"
            });
        }
        if (video.approvalStatusByAdmin === "Approved") {
            // Update video
            await video.update({
                ...video,
                isPublish: isPublish
            });
            // Final Response
            res.status(200).send({
                success: true,
                message: `Video ${message} successfully!`
            });
        } else {
            res.status(400).send({
                success: false,
                message: `This video is not approved!`
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitCourseForApproval = async (req, res) => {
    try {
        const createrId = req.instructor.id;

        // Find Course In Database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                createrId: createrId,
                approvalStatusByAdmin: null
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "This Course is not present!"
            });
        }
        // Change all content approvalStatusByAdmin Pending
        await CourseContent.update({
            approvalStatusByAdmin: "Pending"
        }, {
            where: {
                courseId: req.params.id,
                approvalStatusByAdmin: null,
                createrId: createrId
            }
        });
        // Change all file approvalStatusByAdmin Pending
        await CourseAndContentFile.update({
            approvalStatusByAdmin: "Pending"
        }, {
            where: {
                courseId: req.params.id,
                approvalStatusByAdmin: null,
                createrId: createrId
            }
        });
        // Change all video approvalStatusByAdmin Pending
        await Video.update({
            approvalStatusByAdmin: "Pending"
        }, {
            where: {
                courseId: req.params.id,
                approvalStatusByAdmin: null,
                createrId: createrId
            }
        });
        // Update Course
        await course.update({
            ...course,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Course successfully submit for approval!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitContentForApproval = async (req, res) => {
    try {
        const createrId = req.instructor.id;

        // Find Content In Database
        const content = await CourseContent.findOne({
            where: {
                id: req.params.id,
                createrId: createrId,
                approvalStatusByAdmin: null
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "This content is not present!"
            });
        }
        // Change all file approvalStatusByAdmin Pending
        await CourseAndContentFile.update({
            approvalStatusByAdmin: "Pending"
        }, {
            where: {
                contentId: req.params.id,
                approvalStatusByAdmin: null,
                createrId: createrId
            }
        });
        // Change all video approvalStatusByAdmin Pending
        await Video.update({
            approvalStatusByAdmin: "Pending"
        }, {
            where: {
                contentId: req.params.id,
                approvalStatusByAdmin: null,
                createrId: createrId
            }
        })
        // Update content
        await content.update({
            ...content,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Content successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitFileForApproval = async (req, res) => {
    try {
        const createrId = req.instructor.id;

        // Find Course In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id,
                createrId: createrId,
                approvalStatusByAdmin: null
            }
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "This file is not present!"
            });
        }

        // Update file
        await file.update({
            ...file,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `File successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitVideoForApproval = async (req, res) => {
    try {
        const createrId = req.instructor.id;

        // Find video In Database
        const video = await Video.findOne({
            where: {
                id: req.params.id,
                createrId: createrId,
                approvalStatusByAdmin: null
            }
        });
        if (!video) {
            return res.status(400).send({
                success: false,
                message: "This video is not present!"
            });
        }

        // Update video
        await video.update({
            ...video,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Video successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeCourseUpdationStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find Course In Database
        const courseUpdateHistories = await CourseUpdateHistory.findOne({
            where: {
                id: req.params.id,
                creater: "Instructor"
            }
        });
        if (!courseUpdateHistories) {
            return res.status(400).send({
                success: false,
                message: "This Course updation request is not present!"
            });
        }
        // Find Course
        const course = await Course.findOne({
            where: {
                id: courseUpdateHistories.courseId
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        if (approvalStatusByAdmin === "Approved") {
            // Check is course name is changed
            let courseName = course.courseName;
            const newCourseName = capitalizeFirstLetter(courseUpdateHistories.courseName);
            if (courseName !== newCourseName) {
                const isCourse = await Course.findOne({
                    where: {
                        courseName: newCourseName
                    },
                    paranoid: false
                });
                if (isCourse) {
                    return res.status(400).send({
                        success: false,
                        message: "This course name is present!"
                    });
                } else {
                    courseName = newCourseName;
                }
            }
            // Update Course
            await course.update({
                ...course,
                startingDate: courseUpdateHistories.startingDate,
                endingTime: courseUpdateHistories.endingTime,
                startingTime: courseUpdateHistories.startingTime,
                category: courseUpdateHistories.category,
                courseName: courseUpdateHistories.courseName,
                coursePrice: courseUpdateHistories.coursePrice,
                language: courseUpdateHistories.language,
                heading: courseUpdateHistories.heading,
                description: courseUpdateHistories.description,
                level: courseUpdateHistories.level,
                duration: courseUpdateHistories.duration,
                teacherName: courseUpdateHistories.teacherName,
                introVideoLink: courseUpdateHistories.introVideoLink,
                certificationType: courseUpdateHistories.certificationType,
                certificationFromInstitute: courseUpdateHistories.certificationFromInstitute,
            });
        }
        await courseUpdateHistories.update({
            ...courseUpdateHistories,
            updationStatus: approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Course updation request ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeContentUpdationStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find Content In Database
        const contentUpdateHistories = await ContentUpdateHistory.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!contentUpdateHistories) {
            return res.status(400).send({
                success: false,
                message: "This content updation request is not present!"
            });
        }
        // Find Content
        const content = await CourseContent.findOne({
            where: {
                id: contentUpdateHistories.contentId
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "Content is not present!"
            });
        }
        if (approvalStatusByAdmin === "Approved") {
            // Update content
            await content.update({
                ...content,
                title: contentUpdateHistories.title
            });
        }
        await contentUpdateHistories.update({
            ...contentUpdateHistories,
            updationStatus: approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Chapter updation request ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};