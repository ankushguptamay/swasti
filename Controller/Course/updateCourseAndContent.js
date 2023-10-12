const db = require('../../Models');
const { Op } = require("sequelize");
const { courseValidation } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;

// exports.updateCourse = async (req, res) => {
//     try {
//         // Validate body
//         const { error } = addAdminCourse(req.body);
//         if (error) {
//             console.log(error);
//             return res.status(400).send(error.details[0].message);
//         }
//         const { category, coursePrice, heading, description, level, language, courseName, duration, introVideoLink, coupen, topic, teacherName } = req.body;
//         const course = await AdminCourse.findOne({
//             where: {
//                 id: req.params.id
//             }
//         });
//         if (!course) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Course is not present!"
//             });
//         }
//         await course.update({
//             ...course,
//             category: category,
//             courseName: courseName,
//             coursePrice: coursePrice,
//             language: language,
//             heading: heading,
//             description: description,
//             level: level,
//             duration: duration,
//             coupen: coupen,
//             teacherName: teacherName,
//             introVideoLink: introVideoLink,
//             topic: topic
//         })
//         res.status(200).send({
//             success: true,
//             message: "Course updated successfully!"
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };

exports.updateCourseImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload course image!"
            });
        }
        // Find in database
        let courseImage;
        if (req.instructor) {
            courseImage = await CourseContent.findOne({
                where: {
                    id: req.params.id,
                    createrId: req.instructor.id
                }
            });
        } else {
            courseImage = await CourseContent.findOne({
                where: {
                    id: req.params.id
                }
            });
        }
        if (!courseImage) {
            return res.status(400).send({
                success: false,
                message: "Course Image is not present!"
            });
        }
        // soft delete course image
        await courseImage.destroy();
        // create new one
        const creater = req.admin || req.instructor;
        const createrId = creater.id;
        await CourseContent.create({
            titleOrOriginalName: req.file.originalname,
            linkOrPath: req.file.path,
            mimeType: req.file.mimetype,
            fileName: req.file.filename,
            fieldName: req.file.fieldname,
            createrId: createrId,
            courseId: courseImage.courseId
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Course Image updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateTeacherImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload teacher image!"
            });
        }
        // Find in database
        let teacherImage;
        if (req.instructor) {
            teacherImage = await CourseContent.findOne({
                where: {
                    id: req.params.id,
                    createrId: req.instructor.id
                }
            });
        } else {
            teacherImage = await CourseContent.findOne({
                where: {
                    id: req.params.id
                }
            });
        }
        if (!teacherImage) {
            return res.status(400).send({
                success: false,
                message: "Teacher image is not present!"
            });
        }
        // soft delete teacher image
        await teacherImage.destroy();
        // create new one
        const creater = req.admin || req.instructor;
        const createrId = creater.id;
        await CourseContent.create({
            titleOrOriginalName: req.file.originalname,
            linkOrPath: req.file.path,
            mimeType: req.file.mimetype,
            fileName: req.file.filename,
            fieldName: req.file.fieldname,
            createrId: createrId,
            courseId: teacherImage.courseId
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Teacher Image updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};