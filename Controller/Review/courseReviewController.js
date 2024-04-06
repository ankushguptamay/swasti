const { Op } = require("sequelize");
const db = require('../../Models');
const CourseReview = db.courseReview;
const Course_Student = db.course_Student;
const Course = db.course;
const { reviewValidation } = require("../../Middleware/Validate/validateReview");

exports.giveCourseReview = async (req, res) => {
    try {
        // Validate Body
        const { error } = reviewValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { reviewerName, reviewMessage, reviewStar } = req.body;
        // Check is student has this course
        const isCourseHas = await Course_Student.findOne({
            where: {
                courseId: req.params.id,
                studentId: req.student.id,
                verify: true,
                status: "paid"
            }
        });
        if (!isCourseHas) {
            return res.status(400).send({
                success: false,
                message: "Purchase this course!"
            });
        }
        // store in database
        await CourseReview.create({
            reviewMessage: reviewMessage,
            reviewStar: parseInt(reviewStar),
            reviewerName: reviewerName,
            courseId: req.params.id,
            reviewerId: req.student.id
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Thank you to submit review!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCourseAverageRating = async (req, res) => {
    try {
        // find in database
        const rating = await CourseReview.findAll({
            where: { courseId: req.params.id },
            attributes: [[db.sequelize.fn('AVG', db.sequelize.col('reviewStar')), 'averageRating']],
            raw: true
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Average Rating!",
            data: rating[0]
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCourseReview = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [{ courseId: req.params.id }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { reviewerName: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Review
        const totalReview = await CourseReview.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Review
        const review = await CourseReview.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Review!",
            totalPage: Math.ceil(totalReview / recordLimit),
            currentPage: currentPage,
            data: review
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// exports.deleteCourseReview = async (req, res) => {
//     try {
//         // find in database
//         const review = await CourseReview.findOne({
//             where: { id: req.params.id }
//         });
//         if (!review) {
//             return res.status(400).send({
//                 success: false,
//                 message: "This review is not present!"
//             });
//         }
//         if (req.instructor) {
//             const isInstructorCourse = await Course.findOne({
//                 createrId: req.instructor.id,
//                 id: review.courseId
//             });
//             if (isInstructorCourse) {
//                 await review.destroy();
//             } else {
//                 return res.status(400).send({
//                     success: false,
//                     message: "You can not delete this review!"
//                 });
//             }
//         } else if (req.student) {
//             if (review.reviewerId === req.student.id) {
//                 await review.destroy();
//             } else {
//                 return res.status(400).send({
//                     success: false,
//                     message: "You can not delete this review!"
//                 });
//             }
//         } else if (req.admin) {
//             await review.destroy();
//         } else {
//             return res.status(400).send({
//                 success: false,
//                 message: "You can not delete this review!"
//             });
//         }
//         // Final response
//         res.status(200).send({
//             success: true,
//             message: "Review deleted successfully!"
//         });
//     } catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message
//         });
//     }
// };