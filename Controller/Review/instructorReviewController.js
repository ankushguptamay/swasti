const { Op } = require("sequelize");
const db = require('../../Models');
const InstructorReview = db.instructorReview;
const { instructorReviewValidation } = require("../../Middleware/Validate/validateReview");

exports.giveInstructorReview = async (req, res) => {
    try {
        // Validate Body
        const { error } = instructorReviewValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { reviewerName, reviewMessage, reviewStar } = req.body;
        // store in database
        await InstructorReview.create({
            reviewMessage: reviewMessage,
            reviewStar: parseInt(reviewStar),
            reviewerName: reviewerName,
            instructorId: req.params.id,
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

exports.getInstructorAverageRating = async (req, res) => {
    try {
        let condition;
        // Instructor
        if (req.instructor) {
            condition = { instructorId: req.instructor.id };
        } else if (req.params.id) {
            condition = { instructorId: req.params.id };
        } else {
            return res.status(400).send({
                success: false
            });
        }
        // find in database
        const rating = await InstructorReview.findAll({
            where: condition,
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

exports.getInstructorReview = async (req, res) => {
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
        const condition = [];
        if (search) {
            condition.push({
                [Op.or]: [
                    { reviewerName: { [Op.substring]: search } }
                ]
            })
        }
        // Instructor
        if (req.instructor) {
            condition.push({
                instructorId: req.instructor.id
            });
        } else if (req.params.id) {
            condition.push({
                instructorId: req.params.id
            });
        } else {
            return res.status(400).send({
                success: false
            });
        }
        // Count All Review
        const totalReview = await InstructorReview.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Review
        const review = await InstructorReview.findAll({
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

exports.deleteReview = async (req, res) => {
    try {
        // find in database
        const review = await InstructorReview.findOne({
            where: { id: req.params.id }
        });
        if (!review) {
            return res.status(400).send({
                success: false,
                message: "This review is not present!"
            });
        }
        if (req.instructor) {
            if (review.instructorId === req.instructor.id) {
                await review.destroy();
            } else {
                return res.status(400).send({
                    success: false,
                    message: "You can not delete this review!"
                });

            }
        } else if (req.student) {
            if (review.reviewerId === req.student.id) {
                await review.destroy();
            } else {
                return res.status(400).send({
                    success: false,
                    message: "You can not delete this review!"
                });

            }
        } else if (req.admin) {
            await review.destroy();
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not delete this review!"
            });

        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Review deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};