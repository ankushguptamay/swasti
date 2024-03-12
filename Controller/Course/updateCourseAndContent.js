const db = require('../../Models');
const { Op } = require("sequelize");
const { } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const Course_Discount_Junctions = db.course_Discount_Junction;
const Course_Student_Junctions = db.course_Student_Junction;
const Discount = db.discount;

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

exports.addDiscountToCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const discountId = req.body.id;
        // find discount
        const discount = await Discount.findOne({
            where: {
                id: discountId,
                approvalStatusByAdmin: "Approved"
            }
        });
        if (!discount) {
            return res.status(400).send({
                success: false,
                message: "Either discount is not present or not approved!"
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
        if (req.instructor) {
            await Course_Discount_Junctions.create({
                createrId: req.instructor.id,
                discountId: discountId,
                courseId: courseId
            });
        } else if (req.admin) {
            await Course_Discount_Junctions.create({
                createrId: req.admin.id,
                discountId: discountId,
                courseId: courseId
            });
        } else {
            return res.status(400).send({
                success: true,
                message: "You can not add discount to course!"
            });
        }
        res.status(200).send({
            success: true,
            message: "Discount added to course successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// exports.studentToCourse = async (req, res) => {
//     try {
//         const courseId = req.params.id;
//         const studentId = req.student.id;
//         // find course
//         const course = await Course.findOne({
//             where: {
//                 id: courseId
//             }
//         });
//         if (!course) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Course is not present!"
//             });
//         }
//         // Entry in junction table
//         await Course_Student_Junctions.create({
//             studentId: studentId,
//             courseId: courseId
//         });
//         res.status(200).send({
//             success: true,
//             message: "Course added to Student successfully!"
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };