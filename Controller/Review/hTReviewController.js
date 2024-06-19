const { Op } = require("sequelize");
const db = require('../../Models');
const HTBooking = db.hTBooking;
const HTReview = db.hTReview;
const { reviewValidation } = require("../../Middleware/Validate/validateReview");

exports.giveHTReviewForUser = async (req, res) => {
    try {
        // Validate Body
        const { error } = reviewValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { reviewerName, reviewMessage, reviewStar } = req.body;
        // Check is student has this HT
        const isHTHas = await HTBooking.findOne({
            where: {
                homeTutorId: req.params.id,
                userId: req.student.id,
                verify: true,
                status: "paid"
            }
        });
        if (!isHTHas) {
            return res.status(400).send({
                success: false,
                message: "sorry! you can not give review!"
            });
        }
        const isReview = await HTReview.findOne({
            where: {
                reviewerId: req.student.id,
                homeTutorId: req.params.id
            }
        });
        if (!isReview) {
            // store in database
            await HTReview.create({
                reviewMessage: reviewMessage,
                reviewStar: parseInt(reviewStar),
                reviewerName: reviewerName,
                homeTutorId: req.params.id,
                reviewerId: req.student.id
            });
        }
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

exports.getHTAverageRating = async (req, res) => {
    try {
        // find in database
        const rating = await HTReview.findAll({
            where: { homeTutorId: req.params.id },
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

exports.getHTReview = async (req, res) => {
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
        const condition = [{ homeTutorId: req.params.id }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { reviewerName: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Review
        const totalReview = await HTReview.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Review
        const review = await HTReview.findAll({
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

exports.softDeleteHTReview = async (req, res) => {
    try {
        // find in database
        const review = await HTReview.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!review) {
            return res.status(400).send({
                success: false,
                message: "This review is not present!"
            });
        }
        if (req.instructor) {
            if (review.reviewerId === req.instructor.id) {
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

exports.updateHTReview = async (req, res) => {
    try {
        // Validate Body
        const { error } = reviewValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { reviewerName, reviewMessage, reviewStar } = req.body;
        // find in database
        const review = await HTReview.findOne({
            where: { id: req.params.id }
        });
        if (!review) {
            return res.status(400).send({
                success: false,
                message: "This review is not present!"
            });
        }
        if (req.instructor) {
            if (review.reviewerId === req.instructor.id) {
                await review.update({
                    ...review,
                    reviewMessage: reviewMessage,
                    reviewStar: parseInt(reviewStar),
                    reviewerName: reviewerName,
                });
            } else {
                return res.status(400).send({
                    success: false,
                    message: "You can not update this review!"
                });
            }
        } else if (req.student) {
            if (review.reviewerId === req.student.id) {
                await review.update({
                    ...review,
                    reviewMessage: reviewMessage,
                    reviewStar: parseInt(reviewStar),
                    reviewerName: reviewerName,
                });
            } else {
                return res.status(400).send({
                    success: false,
                    message: "You can not update this review!"
                });
            }
        } else if (req.admin) {
            await review.update({
                ...review,
                reviewMessage: reviewMessage,
                reviewStar: parseInt(reviewStar),
                reviewerName: reviewerName,
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not update this review!"
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Review update successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};