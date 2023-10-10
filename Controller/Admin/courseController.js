const db = require('../../Models');
const { Op } = require("sequelize");
const { addAdminCourse } = require("../../Middleware/validation");
const { deleteSingleFile } = require("../../Util/deleteFile")
const AdminCourse = db.adminCourse;

exports.addCourse = async (req, res) => {
    try {
        // Validate body
        const { error } = addAdminCourse(req.body);
        if (error) {
            if (req.files.courseImage) {
                deleteSingleFile(req.files.courseImage[0].path);
            }
            if (req.files.teacherImage) {
                deleteSingleFile(req.files.teacherImage[0].path);
            }
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { category, coursePrice, heading, description, level, language, courseName, duration, introVideoLink, coupen, topic, teacherName } = req.body;
        if (req.files.courseImage && req.files.teacherImage) {
            await AdminCourse.create({
                category: category,
                courseName: courseName,
                coursePrice: coursePrice,
                language: language,
                heading: heading,
                description: description,
                level: level,
                duration: duration,
                coupen: coupen,
                teacherName: teacherName,
                introVideoLink: introVideoLink,
                topic: topic,
                courseImage: req.files.courseImage[0].path,
                teacherImage: req.files.teacherImage[0].path,
                createrCode: req.user.code
            });
            res.status(200).send({
                success: true,
                message: "Course Created successfully!"
            });
        } else {
            if (req.files.courseImage) {
                deleteSingleFile(req.files.courseImage[0].path);
            }
            if (req.files.teacherImage) {
                deleteSingleFile(req.files.teacherImage[0].path);
            }
            return res.status(400).send({
                success: false,
                message: "Please..Upload respected images!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllCourse = async (req, res) => {
    try {
        const course = await AdminCourse.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// exports.getCourseById = async (req, res) => {
//     try {
//         const course = await AdminCourse.findOne({
//             where: {
//                 id: req.params.id
//             },
//             include: [{
//                 model: AdminCourseContent,
//                 as: 'courseContent',
//                 order: [
//                     ['createdAt', 'ASC']
//                 ]
//             }]
//         });
//         res.status(200).send({
//             success: true,
//             message: "course fetched successfully!",
//             data: course
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };

exports.updateCourse = async (req, res) => {
    try {
        // Validate body
        const { error } = addAdminCourse(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { category, coursePrice, heading, description, level, language, courseName, duration, introVideoLink, coupen, topic, teacherName } = req.body;
        const course = await AdminCourse.findOne({
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
        await course.update({
            ...course,
            category: category,
            courseName: courseName,
            coursePrice: coursePrice,
            language: language,
            heading: heading,
            description: description,
            level: level,
            duration: duration,
            coupen: coupen,
            teacherName: teacherName,
            introVideoLink: introVideoLink,
            topic: topic
        })
        res.status(200).send({
            success: true,
            message: "Course updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateCourseImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload course image!"
            });
        }
        const course = await AdminCourse.findOne({
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
        if (course.courseImage) {
            deleteSingleFile(course.courseImage);
        }
        await course.update({
            ...course,
            courseImage: req.file.path
        })
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
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload course image!"
            });
        }
        const course = await AdminCourse.findOne({
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
        if (course.teacherImage) {
            deleteSingleFile(course.teacherImage);
        }
        await course.update({
            ...course,
            teacherImage: req.file.path
        })
        res.status(200).send({
            success: true,
            message: "Course Teacher Image updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await AdminCourse.findOne({
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
        if (course.courseImage) {
            deleteSingleFile(course.courseImage);
        }
        if (course.teacherImage) {
            deleteSingleFile(course.teacherImage);
        }
        await course.destroy()
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