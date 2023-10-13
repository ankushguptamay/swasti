const db = require('../../Models');
const { Op } = require("sequelize");
const { courseValidation } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;

// For Admin And Instructor
exports.addCourse = async (req, res) => {
    try {
        // Manage File
        let courseImage;
        let teacherImage;
        if (req.files) {
            if (req.files.CourseImage) {
                courseImage = req.files.CourseImage[0];
            }
            if (req.files.TeacherImage) {
                teacherImage = req.files.TeacherImage[0];
            }
        }
        // Validate body
        const { error } = courseValidation(req.body);
        if (error) {
            // If Error Delete File
            if (courseImage) {
                deleteSingleFile(courseImage.path);
            }
            if (teacherImage) {
                deleteSingleFile(teacherImage.path);
            }
            return res.status(400).send(error.details[0].message);
        }
        const { category, coursePrice, heading, description, level, language, courseName, duration, introVideoLink, teacherName } = req.body;
        // Set approvalStatusByAdmin according to creater
        let approvalStatusByAdmin;
        let createrId;
        if (req.instructor) {
            createrId = req.instructor.id;
            approvalStatusByAdmin = "Pending";
        } else if (req.admin) {
            createrId = req.admin.id;
            approvalStatusByAdmin = "Approved";
        } else {
            if (courseImage) {
                deleteSingleFile(courseImage.path);
            }
            if (teacherImage) {
                deleteSingleFile(teacherImage.path);
            }
            return res.status(400).send({
                success: false,
                message: "You can not create course!"
            });
        }
        // store in database
        const course = await Course.create({
            category: category,
            courseName: courseName,
            coursePrice: coursePrice,
            language: language,
            heading: heading,
            description: description,
            level: level,
            duration: duration,
            teacherName: teacherName,
            introVideoLink: introVideoLink,
            createrId: createrId,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        if (courseImage) {
            await CourseContent.create({
                titleOrOriginalName: courseImage.originalname,
                linkOrPath: courseImage.path,
                mimeType: courseImage.mimetype,
                fileName: courseImage.filename,
                fieldName: courseImage.fieldname,
                createrId: createrId,
                courseId: course.id,
                approvalStatusByAdmin: approvalStatusByAdmin
            });
        }
        if (teacherImage) {
            await CourseContent.create({
                titleOrOriginalName: teacherImage.originalname,
                linkOrPath: teacherImage.path,
                mimeType: teacherImage.mimetype,
                fileName: teacherImage.filename,
                fieldName: teacherImage.fieldname,
                createrId: createrId,
                courseId: course.id,
                approvalStatusByAdmin: approvalStatusByAdmin
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Course Created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addCourseImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload course image!"
            });
        }
        // Find in database
        if (req.instructor) {
            const courseImage = await CourseContent.findAll({
                where: {
                    courseId: req.params.id,
                    createrId: req.instructor.id,
                    fieldName: "CourseImage",
                    deletedAt: null
                }
            });
            if (courseImage.length > 0) {
                for (let i = 0; i < courseImage.length; i++) {
                    await courseImage[i].destroy();
                }
            }
            await CourseContent.create({
                titleOrOriginalName: req.file.originalname,
                linkOrPath: req.file.path,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.instructor.id,
                courseId: req.params.id,
                approvalStatusByAdmin: "Pending"
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Course Image updated successfully!"
            });
        } else if (req.admin) {
            const courseImage = await CourseContent.findAll({
                where: {
                    courseId: req.params.id,
                    fieldName: "CourseImage",
                    deletedAt: null
                }
            });
            if (courseImage.length > 0) {
                for (let i = 0; i < courseImage.length; i++) {
                    await courseImage[i].destroy();
                }
            }
            await CourseContent.create({
                titleOrOriginalName: req.file.originalname,
                linkOrPath: req.file.path,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.admin.id,
                courseId: req.params.id,
                approvalStatusByAdmin: "Approved"
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Course Image updated successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not update course image!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addTeacherImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload teacher image!"
            });
        }
        // Find in database
        if (req.instructor) {
            const teacherImage = await CourseContent.findAll({
                where: {
                    courseId: req.params.id,
                    createrId: req.instructor.id,
                    fieldName: "TeacherImage",
                    deletedAt: null
                }
            });
            if (teacherImage.length > 0) {
                for (let i = 0; i < teacherImage.length; i++) {
                    await teacherImage[i].destroy();
                }
            }
            await CourseContent.create({
                titleOrOriginalName: req.file.originalname,
                linkOrPath: req.file.path,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.instructor.id,
                courseId: req.params.id,
                approvalStatusByAdmin: "Pending"
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Teacher Image updated successfully!"
            });
        } else if (req.admin) {
            const teacherImage = await CourseContent.findAll({
                where: {
                    courseId: req.params.id,
                    fieldName: "TeacherImage",
                    deletedAt: null
                }
            });
            if (teacherImage.length > 0) {
                for (let i = 0; i < teacherImage.length; i++) {
                    await teacherImage[i].destroy();
                }
            }
            await CourseContent.create({
                titleOrOriginalName: req.file.originalname,
                linkOrPath: req.file.path,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.admin.id,
                courseId: req.params.id,
                approvalStatusByAdmin: "Approved"
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Teacher Image updated successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not update teacher image!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};