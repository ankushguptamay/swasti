const db = require('../../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;

exports.totalCourse = async (req, res) => {
    try {
        const courses = await Course.count({ where: { createrId: req.instructor.id } });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total courses fetched successfully!`,
            data: courses
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.totalOngoingCourse = async (req, res) => {
    try {
        const courses = await Course.count({ where: { createrId: req.instructor.id, isPublish: true } });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total ongoing courses fetched successfully!`,
            data: courses
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.totalDraftedCourse = async (req, res) => {
    try {
        const courses = await Course.count({ where: { createrId: req.instructor.id, isPublish: false } });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total drafted courses fetched successfully!`,
            data: courses
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getContentAndFile = async (req, res) => {
    try {
        const totalContent = await CourseContent.count({
            where: {
                courseId: req.params.id,
                createrId: req.instructor.id,
                approvalStatusByAdmin: "Approved"
            }
        });
        const totalFile = await CourseAndContentFile.count({
            where: {
                courseId: req.params.id,
                createrId: req.instructor.id,
                fieldName: 'ContentFile',
                approvalStatusByAdmin: "Approved"
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Fetched successfully!`,
            data: {
                totalContent: totalContent,
                totalFile: totalFile
            }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};