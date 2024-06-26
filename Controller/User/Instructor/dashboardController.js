const db = require('../../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Course_Student = db.course_Student;

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
        const courses = await Course.count({
            where: {
                createrId: req.instructor.id,
                isPublish: false,
                [Op.or]: [
                    { approvalStatusByAdmin: "Approved" },
                    { approvalStatusByAdmin: "Pending" }
                ]
            }
        });
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
        const courses = await Course.count({ where: { createrId: req.instructor.id, approvalStatusByAdmin: null } });
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

exports.totalStudent = async (req, res) => {
    try {
        // Total course
        const courses = await Course.findAll({ where: { createrId: req.instructor.id } });
        const courseId = [];
        for (let i = 0; i < courses.length; i++) {
            courseId.push(courses[i].id);
        }
        const totalStudent = await Course_Student.count({
            where: {
                courseId: courseId,
                status: "Paid",
                verify: true
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total student fetched successfully!`,
            data: totalStudent
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};