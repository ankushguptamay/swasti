const db = require('../../Models');
const { Op } = require("sequelize");
const { } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const Course_Coupon = db.course_Coupon;
const Course_Student = db.course_Student;
const Coupon = db.coupon;
const Video = db.videos;

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

exports.studentToCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).send({
                success: true,
                message: "Select a student!"
            });
        }
        // find course
        const course = await Course.findOne({
            where: {
                id: courseId
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Entry in junction table
        await Course_Student.create({
            studentId: studentId,
            courseId: courseId,
            verify: true,
            status: "paid"
        });
        res.status(200).send({
            success: true,
            message: "Course added to Student successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};