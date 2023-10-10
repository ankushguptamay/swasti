const db = require('../../Models');
const { Op } = require("sequelize");
const { addAdminCourseContent } = require("../../Middleware/validation");
const AdminCourseContent = db.adminCourseContent;
const Student_Course = db.student_Course;

exports.addCourseContent = async (req, res) => {
    try {
        // Validate body
        const { error } = addAdminCourseContent(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { videoTitle, videoLink, videoType, course, subject, courseId } = req.body;
        await AdminCourseContent.create({
            videoLink: videoLink,
            videoTitle: videoTitle,
            videoType: videoType,
            subject: subject,
            course: course,
            courseId: courseId,
            createrCode: req.user.code
        });
        res.status(200).send({
            success: true,
            message: "Course Content Created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// for admin
exports.getCourseContentByCourseId = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const content = await AdminCourseContent.findAll({
            where: { courseId: courseId },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Course content fetched successfully!",
            data: content
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// for student/public
exports.getCourseContentByCourseIdForStudent = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentId = req.student.id;
        const isCourse = await Student_Course.findOne({
            where: {
                studentId: studentId,
                adminCourseId: courseId
            }
        });
        if (!isCourse) {
            res.status(400).send({
                success: false,
                message: "You can't access this course!"
            });
        } else {
            const content = await AdminCourseContent.findAll({
                where: { courseId: courseId },
                order: [
                    ['createdAt', 'ASC']
                ]
            });
            res.status(200).send({
                success: true,
                message: "Course content fetched successfully!",
                data: content
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// for admin
exports.updateCourseContent = async (req, res) => {
    try {
        // Validate body
        const { error } = addAdminCourseContent(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const adminCourseContent = await AdminCourseContent.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!adminCourseContent) {
            return res.status(400).send({
                success: true,
                message: "Course Content is not present!"
            });
        }
        const { videoTitle, videoLink, videoType, subject } = req.body;
        await adminCourseContent.update({
            ...adminCourseContent,
            videoLink: videoLink,
            videoTitle: videoTitle,
            videoType: videoType,
            subject: subject
        });
        res.status(200).send({
            success: true,
            message: "Course Content updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// for admin
exports.deleteCourseContent = async (req, res) => {
    try {
        const adminCourseContent = await AdminCourseContent.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!adminCourseContent) {
            return res.status(400).send({
                success: true,
                message: "Course Content is not present!"
            });
        }
        await adminCourseContent.destroy();
        res.status(200).send({
            success: true,
            message: "Course Content deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};