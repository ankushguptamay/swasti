const db = require('../../Models');
const { Op } = require("sequelize");
const { courseValidation, contentValidation, contentVideoValidation } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;

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
        const { category, coursePrice, heading, description, level, language, courseName, duration, introVideoLink, teacherName, certificationType, certificationFromInstitute } = req.body;
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
            certificationType: certificationType,
            certificationFromInstitute: certificationFromInstitute,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        if (courseImage) {
            await CourseAndContentFile.create({
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
            await CourseAndContentFile.create({
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
            const courseImage = await CourseAndContentFile.findAll({
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
            await CourseAndContentFile.create({
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
                message: "Course Image added successfully! Wait For Admin Approval!"
            });
        } else if (req.admin) {
            const courseImage = await CourseAndContentFile.findAll({
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
            await CourseAndContentFile.create({
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
                message: "Course Image added successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not add course image!"
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
            const teacherImage = await CourseAndContentFile.findAll({
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
            await CourseAndContentFile.create({
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
                message: "Teacher Image added successfully! Wait For Admin Approval!"
            });
        } else if (req.admin) {
            const teacherImage = await CourseAndContentFile.findAll({
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
            await CourseAndContentFile.create({
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
                message: "Teacher Image added successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not add teacher image!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin And Instructor
exports.addContent = async (req, res) => {
    try {
        // Validate body
        const { error } = contentValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { title } = req.body;
        if (req.instructor) {
            await CourseContent.create({
                title: title,
                createrId: req.instructor.id,
                courseId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Content created successfully!"
            });
        } else if (req.admin) {
            await CourseContent.create({
                title: title,
                createrId: req.amdin.id,
                courseId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Content created successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not add content!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin And Instructor
exports.addContentVideo = async (req, res) => {
    try {
        // Validate body
        const { error } = contentVideoValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { titleOrOriginalName, linkOrPath } = req.body;
        const mimeType = 'video';
        const fieldName = 'ContentFile';
        const fileContent = await CourseContent.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!fileContent) {
            // Final response
            return res.status(400).send({
                success: false,
                message: "Content is not present!"
            });
        }
        if (req.instructor) {
            await CourseAndContentFile.create({
                titleOrOriginalName: titleOrOriginalName,
                linkOrPath: linkOrPath,
                mimeType: mimeType,
                createrId: req.instructor.id,
                fieldName: fieldName,
                courseId: fileContent.courseId,
                approvalStatusByAdmin: "Pending",
                contentId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Video added successfully!"
            });
        } else if (req.admin) {
            await CourseAndContentFile.create({
                titleOrOriginalName: titleOrOriginalName,
                linkOrPath: linkOrPath,
                mimeType: mimeType,
                createrId: req.admin.id,
                fieldName: fieldName,
                courseId: fileContent.courseId,
                approvalStatusByAdmin: "Approved",
                contentId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Video added successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not add video!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin And Instructor
exports.addContentFile = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload Content file!"
            });
        }
        const fileContent = await CourseContent.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!fileContent) {
            // Final response
            return res.status(400).send({
                success: false,
                message: "Content is not present!"
            });
        }
        if (req.instructor) {
            await CourseAndContentFile.create({
                titleOrOriginalName: req.file.originalname,
                linkOrPath: req.file.path,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.instructor.id,
                courseId: fileContent.courseId,
                approvalStatusByAdmin: "Pending",
                contentId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "File added successfully!"
            });
        } else if (req.admin) {
            await CourseAndContentFile.create({
                titleOrOriginalName: req.file.originalname,
                linkOrPath: req.file.path,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.admin.id,
                courseId: fileContent.courseId,
                approvalStatusByAdmin: "Approved",
                contentId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "File added successfully!"
            });
        } else {
            // Final response
            res.status(400).send({
                success: false,
                message: "You can not add file!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};