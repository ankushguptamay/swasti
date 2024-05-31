const db = require('../../Models');
const { Op } = require("sequelize");
const { courseValidation, contentValidation, addRecordedVideo } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const { capitalizeFirstLetter, createCodeForCourse } = require("../../Util/capitalizeFirstLetter");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Video = db.videos;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


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
        const { category, coursePrice, heading, description, level, language, duration, introVideoLink, teacherName, certificationType, certificationFromInstitute, startingTime, endingTime, startingDate } = req.body;
        // Check course name duplicacy
        const courseName = capitalizeFirstLetter(req.body.courseName);
        const isCourse = await Course.findOne({
            where: {
                courseName: courseName
            },
            paranoid: false
        });
        if (isCourse) {
            if (courseImage) {
                deleteSingleFile(courseImage.path);
            }
            if (teacherImage) {
                deleteSingleFile(teacherImage.path);
            }
            return res.status(400).send({
                success: false,
                message: "This course is present!"
            });
        }
        const courseCode = createCodeForCourse(courseName);
        // Set approvalStatusByAdmin according to creater
        let approvalStatusByAdmin;
        let createrId, creater;
        if (req.instructor) {
            createrId = req.instructor.id;
            creater = "Instructor";
            approvalStatusByAdmin = null;
        } else if (req.admin) {
            creater = "Admin";
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
            startingDate: startingDate,
            endingTime: endingTime,
            startingTime: startingTime,
            category: category,
            courseName: courseName,
            courseCode: courseCode,
            coursePrice: coursePrice,
            language: language,
            heading: heading,
            description: description,
            level: level,
            duration: duration,
            teacherName: teacherName,
            introVideoLink: introVideoLink,
            createrId: createrId,
            creater: creater,
            certificationType: certificationType,
            certificationFromInstitute: certificationFromInstitute,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        if (courseImage) {
            const imagePath = `./Resource/${courseImage.filename}`;
            const response = await cloudinary.uploader.upload(imagePath);
            // delete file from resource/servere
            deleteSingleFile(courseImage.path);
            await CourseAndContentFile.create({
                cloudinaryFileId: response.public_id,
                titleOrOriginalName: courseImage.originalname,
                linkOrPath: response.secure_url,
                mimeType: courseImage.mimetype,
                fileName: courseImage.filename,
                fieldName: courseImage.fieldname,
                createrId: createrId,
                creater: creater,
                courseId: course.id,
                approvalStatusByAdmin: approvalStatusByAdmin
            });
        }
        if (teacherImage) {
            const imagePath = `./Resource/${teacherImage.filename}`;
            const response = await cloudinary.uploader.upload(imagePath);
            // delete file from resource/servere
            deleteSingleFile(teacherImage.path);
            await CourseAndContentFile.create({
                cloudinaryFileId: response.public_id,
                titleOrOriginalName: teacherImage.originalname,
                linkOrPath: response.secure_url,
                mimeType: teacherImage.mimetype,
                fileName: teacherImage.filename,
                fieldName: teacherImage.fieldname,
                creater: creater,
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
        let creater, createrId, approvalStatusByAdmin, condition;
        if (req.instructor) {
            condition = {
                courseId: req.params.id,
                createrId: req.instructor.id,
                fieldName: "CourseImage"
            };
            createrId = req.instructor.id;
            creater = "Instructor";
            approvalStatusByAdmin = null;
        } else if (req.admin) {
            condition = {
                courseId: req.params.id,
                fieldName: "CourseImage"
            };
            createrId = req.admin.id;
            creater = "Admin";
            approvalStatusByAdmin = "Approved";
        } else {
            deleteSingleFile(req.file.path);
            res.status(400).send({
                success: false,
                message: "You can not add course image!"
            });
        }
        const imagePath = `./Resource/${req.file.filename}`;
        const response = await cloudinary.uploader.upload(imagePath);
        // console.log(response);
        // delete file from resource/servere
        deleteSingleFile(req.file.path);
        const courseImage = await CourseAndContentFile.findAll({
            where: condition
        });
        if (courseImage.length > 0) {
            for (let i = 0; i < courseImage.length; i++) {
                await courseImage[i].update({ deletedThrough: "ByUpdation" });
                await courseImage[i].destroy();
            }
        }
        await CourseAndContentFile.create({
            cloudinaryFileId: response.public_id,
            titleOrOriginalName: req.file.originalname,
            linkOrPath: response.secure_url,
            mimeType: req.file.mimetype,
            fileName: req.file.filename,
            fieldName: req.file.fieldname,
            createrId: createrId,
            creater: creater,
            courseId: req.params.id,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Course Image added successfully!"
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err
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
        let creater, createrId, approvalStatusByAdmin, condition;
        if (req.instructor) {
            condition = {
                courseId: req.params.id,
                createrId: req.instructor.id,
                fieldName: "TeacherImage"
            };
            createrId = req.instructor.id;
            creater = "Instructor";
            approvalStatusByAdmin = null;
        } else if (req.admin) {
            condition = {
                courseId: req.params.id,
                fieldName: "TeacherImage"
            };
            createrId = req.admin.id;
            creater = "Admin";
            approvalStatusByAdmin = "Approved";
        } else {
            deleteSingleFile(req.file.path);
            res.status(400).send({
                success: false,
                message: "You can not add course image!"
            });
        }
        const imagePath = `./Resource/${req.file.filename}`;
        const response = await cloudinary.uploader.upload(imagePath);
        // delete file from resource/servere
        deleteSingleFile(req.file.path);
        const teacherImage = await CourseAndContentFile.findAll({
            where: condition
        });
        if (teacherImage.length > 0) {
            for (let i = 0; i < teacherImage.length; i++) {
                await teacherImage[i].update({ deletedThrough: "ByUpdation" });
                await teacherImage[i].destroy();
            }
        }
        await CourseAndContentFile.create({
            cloudinaryFileId: response.public_id,
            titleOrOriginalName: req.file.originalname,
            linkOrPath: response.secure_url,
            mimeType: req.file.mimetype,
            fileName: req.file.filename,
            fieldName: req.file.fieldname,
            createrId: createrId,
            creater: creater,
            courseId: req.params.id,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Teacher Image added successfully!"
        });

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
        const { title, courseId } = req.body;
        if (req.instructor) {
            await CourseContent.create({
                title: title,
                createrId: req.instructor.id,
                creater: "Instructor",
                courseId: courseId,
                approvalStatusByAdmin: null
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Content created successfully!"
            });
        } else if (req.admin) {
            await CourseContent.create({
                title: title,
                createrId: req.admin.id,
                creater: "Admin",
                courseId: courseId,
                approvalStatusByAdmin: "Approved"
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
exports.addRecordedVideo = async (req, res) => {
    try {
        // Validate body
        const { error } = addRecordedVideo(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { startingTime, endingTime, titleOrOriginalName, linkOrPath } = req.body;
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
            await Video.create({
                titleOrOriginalName: titleOrOriginalName,
                linkOrPath: linkOrPath,
                startingTime: startingTime,
                endingTime: endingTime,
                mimeType: "video",
                modeOfVideo: "Record",
                courseId: fileContent.courseId,
                approvalStatusByAdmin: null,
                contentId: req.params.id,
                createrId: req.instructor.id,
                creater: "Instructor",
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "Video added successfully!"
            });
        } else if (req.admin) {
            await Video.create({
                titleOrOriginalName: titleOrOriginalName,
                linkOrPath: linkOrPath,
                startingTime: startingTime,
                endingTime: endingTime,
                mimeType: "video",
                modeOfVideo: "Record",
                courseId: fileContent.courseId,
                approvalStatusByAdmin: "Approved",
                contentId: req.params.id,
                createrId: req.admin.id,
                creater: "Admin",
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
        const imagePath = `./Resource/${req.file.filename}`;
        const response = await cloudinary.uploader.upload(imagePath);
        // delete file from resource/servere
        deleteSingleFile(req.file.path);
        if (req.instructor) {
            await CourseAndContentFile.create({
                cloudinaryFileId: response.public_id,
                titleOrOriginalName: req.file.originalname,
                linkOrPath: response.secure_url,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.instructor.id,
                creater: "Instructor",
                courseId: fileContent.courseId,
                approvalStatusByAdmin: null,
                contentId: req.params.id
            });
            // Final response
            res.status(200).send({
                success: true,
                message: "File added successfully!"
            });
        } else if (req.admin) {
            await CourseAndContentFile.create({
                cloudinaryFileId: response.public_id,
                titleOrOriginalName: req.file.originalname,
                linkOrPath: response.secure_url,
                mimeType: req.file.mimetype,
                fileName: req.file.filename,
                fieldName: req.file.fieldname,
                createrId: req.admin.id,
                creater: "Admin",
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
            await cloudinary.uploader.destroy(response.public_id);
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