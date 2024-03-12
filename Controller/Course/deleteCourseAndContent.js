const db = require('../../Models');
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;

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
        // Soft Delete Files
        await CourseAndContentFile.destroy({
            where: {
                courseId: req.params.id
            }
        });

        // Soft Delete Content
        await CourseContent.destroy({
            where: {
                courseId: req.params.id
            }
        });

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
        // Soft Delete Files
        await CourseAndContentFile.destroy({
            where: {
                courseId: req.params.id
            }
        });

        // Soft Delete Content
        await CourseContent.destroy({
            where: {
                courseId: req.params.id
            }
        });
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
        // Soft Delete Files
        const file = await CourseAndContentFile.findAll({
            where: {
                contentId: req.params.id,
                fieldName: "ContentFile"
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        if (file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                await file[i].destroy();
            }
        }
        // If this course is not created by admin then some notification should go to admin
        // Soft Delete
        await courseContent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Content deleted successfully!`
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
        // Soft Delete Files
        const file = await CourseAndContentFile.findAll({
            where: {
                contentId: req.params.id,
                fieldName: "ContentFile"
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        if (file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                await file[i].destroy();
            }
        }
        // Soft Delete
        await courseContent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Content deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteFileForAdmin = async (req, res) => {
    try {
        // Find Course Content In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // If this course is not created by admin then some notification should go to admin
        // Soft Delete
        await file.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `${file.fieldName} deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteFileForInstructor = async (req, res) => {
    try {
        // Find Course Content In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id
            }
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // Soft Delete
        await file.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `${file.fieldName} deleted successfully!`
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
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Hard Delete Files
        const file = await CourseAndContentFile.findAll({
            where: {
                courseId: req.params.id
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        if (file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                // Delete File
                if (file[i].linkOrPath && file[i].mimeType !== 'video') {
                    deleteSingleFile(file[i].linkOrPath);
                }
                await file[i].destroy({ force: true });
            }
        }
        // Hard Delete Content
        await CourseContent.destroy({
            where: {
                courseId: req.params.id
            },
            paranoid: false,
            force: true
        });
        // Hard Delete Course
        await course.destroy({ force: true });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course has removed from database permanent!"
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
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!courseContent) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // Hard Delete Files
        const file = await CourseAndContentFile.findAll({
            where: {
                contentId: req.params.id,
                fieldName: "ContentFile"
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        if (file.length > 0) {
            for (let i = 0; i < file.length; i++) {
                // Delete File
                if (file[i].linkOrPath && file[i].mimeType !== 'video') {
                    deleteSingleFile(file[i].linkOrPath);
                }
                await file[i].destroy({ force: true });
            }
        }
        // If this course is not created by admin then some notification should go to admin
        // Hard Delete
        await courseContent.destroy({ force: true });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Content has removed from database permanent!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.hardDeleteFile = async (req, res) => {
    try {
        // Find File In Database
        const file = await CourseAndContentFile.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // Hard Delete Files
        // Delete File
        if (file.linkOrPath && file.mimeType !== 'video') {
            deleteSingleFile(file.linkOrPath);
        }
        await file.destroy({ force: true });
        res.status(200).send({
            success: true,
            message: "Content has removed from database permanent!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};
