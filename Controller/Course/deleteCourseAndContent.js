const db = require('../../Models');
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Video = db.videos;

exports.softDeleteCourse = async (req, res) => {
    try {
        let deletedThrough, condition;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                createrId: req.instructor.id
            };
            deletedThrough = "Instructor";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            };
            deletedThrough = "Admin";
        } else {
            res.status(400).send({
                success: false,
                message: "You can not delete this course!"
            });
        }
        // Find Course In Database
        const course = await Course.findOne({
            where: condition
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        await course.update({ deletedThrough: deletedThrough });
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

exports.softDeleteContent = async (req, res) => {
    try {
        let deletedThrough, condition;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                createrId: req.instructor.id
            };
            deletedThrough = "Instructor";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            };
            deletedThrough = "Admin";
        } else {
            res.status(400).send({
                success: false,
                message: "You can not delete this content!"
            });
        }
        // Find Course Content In Database
        const courseContent = await CourseContent.findOne({
            where: condition
        });
        if (!courseContent) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // If this course is not created by admin then some notification should go to admin
        await courseContent.update({ deletedThrough: deletedThrough });
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

exports.softDeleteFile = async (req, res) => {
    try {
        let deletedThrough, condition;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                createrId: req.instructor.id
            };
            deletedThrough = "Instructor";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            };
            deletedThrough = "Admin";
        } else {
            res.status(400).send({
                success: false,
                message: "You can not delete this file!"
            });
        }
        // Find file In Database
        const file = await CourseAndContentFile.findOne({
            where: condition
        });
        if (!file) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // If this course is not created by admin then some notification should go to admin
        await file.update({ deletedThrough: deletedThrough });
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

exports.softDeleteVideo = async (req, res) => {
    try {
        let deletedThrough, condition;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                createrId: req.instructor.id
            };
            deletedThrough = "Instructor";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            };
            deletedThrough = "Admin";
        } else {
            res.status(400).send({
                success: false,
                message: "You can not delete this video!"
            });
        }
        // Find video In Database
        const video = await Video.findOne({
            where: condition
        });
        if (!video) {
            return res.status(400).send({
                success: false,
                message: "Data is not present!"
            });
        }
        // If this course is not created by admin then some notification should go to admin
        await video.update({ deletedThrough: deletedThrough });
        // Soft Delete
        await video.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Video deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// exports.hardDeleteCourse = async (req, res) => {
//     try {
//         // Find Course In Database
//         const course = await Course.findOne({
//             where: {
//                 id: req.params.id,
//                 deletedAt: { [Op.ne]: null }
//             },
//             paranoid: false
//         });
//         if (!course) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Course is not present!"
//             });
//         }
//         // Hard Delete Files
//         const file = await CourseAndContentFile.findAll({
//             where: {
//                 courseId: req.params.id
//             },
//             order: [
//                 ['createdAt', 'DESC']
//             ],
//             paranoid: false
//         });
//         if (file.length > 0) {
//             for (let i = 0; i < file.length; i++) {
//                 // Delete File
//                 if (file[i].linkOrPath && file[i].mimeType !== 'video') {
//                     deleteSingleFile(file[i].linkOrPath);
//                 }
//                 await file[i].destroy({ force: true });
//             }
//         }
//         // Hard Delete Content
//         await CourseContent.destroy({
//             where: {
//                 courseId: req.params.id
//             },
//             paranoid: false,
//             force: true
//         });
//         // Hard Delete Course
//         await course.destroy({ force: true });
//         // Final Response
//         res.status(200).send({
//             success: true,
//             message: "Course has removed from database permanent!"
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };

// exports.hardDeleteContent = async (req, res) => {
//     try {
//         // Find Course Content In Database
//         const courseContent = await CourseContent.findOne({
//             where: {
//                 id: req.params.id,
//                 deletedAt: { [Op.ne]: null }
//             },
//             paranoid: false
//         });
//         if (!courseContent) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Data is not present!"
//             });
//         }
//         // Hard Delete Files
//         const file = await CourseAndContentFile.findAll({
//             where: {
//                 contentId: req.params.id,
//                 fieldName: "ContentFile"
//             },
//             order: [
//                 ['createdAt', 'DESC']
//             ],
//             paranoid: false
//         });
//         if (file.length > 0) {
//             for (let i = 0; i < file.length; i++) {
//                 // Delete File
//                 if (file[i].linkOrPath && file[i].mimeType !== 'video') {
//                     deleteSingleFile(file[i].linkOrPath);
//                 }
//                 await file[i].destroy({ force: true });
//             }
//         }
//         // If this course is not created by admin then some notification should go to admin
//         // Hard Delete
//         await courseContent.destroy({ force: true });
//         // Final Response
//         res.status(200).send({
//             success: true,
//             message: "Content has removed from database permanent!"
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };

// exports.hardDeleteFile = async (req, res) => {
//     try {
//         // Find File In Database
//         const file = await CourseAndContentFile.findOne({
//             where: {
//                 id: req.params.id,
//                 deletedAt: { [Op.ne]: null }
//             },
//             paranoid: false
//         });
//         if (!file) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Data is not present!"
//             });
//         }
//         // Hard Delete Files
//         // Delete File
//         if (file.linkOrPath && file.mimeType !== 'video') {
//             deleteSingleFile(file.linkOrPath);
//         }
//         await file.destroy({ force: true });
//         res.status(200).send({
//             success: true,
//             message: "Content has removed from database permanent!"
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };
