const db = require('../../Models');
const { Op } = require("sequelize");
const Instructor = db.instructor;
const Student = db.student;
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Course_Student = db.course_Student;

exports.totalCourse = async (req, res) => {
    try {
        const courses = await Course.count();
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

exports.totalVerifiedCourse = async (req, res) => {
    try {
        const courses = await Course.count({
            where: {
                approvalStatusByAdmin: "Approved"
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total verified courses fetched successfully!`,
            data: courses
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.totalPendingCourse = async (req, res) => {
    try {
        const courses = await Course.count({
            where: {
                approvalStatusByAdmin: "Pending"
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total pending courses fetched successfully!`,
            data: courses
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.totalPublishedCourse = async (req, res) => {
    try {
        const courses = await Course.count({
            where: {
                approvalStatusByAdmin: "Approved",
                isPublish: true,
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total pending courses fetched successfully!`,
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
                approvalStatusByAdmin: { [Op.ne]: null }
            }
        });
        const totalFile = await CourseAndContentFile.count({
            where: {
                courseId: req.params.id,
                approvalStatusByAdmin: { [Op.ne]: null },
                fieldName: 'ContentFile'
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
        const totalStudent = await Student.count();
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

exports.totalInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.count();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Total instructor fetched successfully!`,
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};