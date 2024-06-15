const { Op } = require("sequelize");
const db = require('../../Models');
const YogaStudioReview = db.ysReview;
const { reviewValidation } = require("../../Middleware/Validate/validateReview");

exports.giveYSReview = async (req, res) => {
    try {
        let reviewer;
        if (req.student) {
            reviewer = req.student.id;
        } else if (req.instructor) {
            reviewer = req.student.id;
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not give review!"
            });
        }
        // Validate Body
        const { error } = reviewValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { reviewerName, reviewMessage, reviewStar } = req.body;
        const isReview = await YogaStudioReview.findOne({
            where: {
                businessId: req.params.id,
                reviewerId: reviewer
            }
        });
        if (!isReview) {
            // store in database
            await YogaStudioReview.create({
                reviewMessage: reviewMessage,
                reviewStar: parseInt(reviewStar),
                reviewerName: reviewerName,
                businessId: req.params.id,
                reviewerId: reviewer
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

exports.getYSAverageRating = async (req, res) => {
    try {
        // find in database
        const rating = await YogaStudioReview.findAll({
            where: { businessId: req.params.id },
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

exports.getYSReview = async (req, res) => {
    try {
        const { page, limit, search, start } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [{ businessId: req.params.id }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { reviewerName: { [Op.substring]: search } },
                    { reviewMessage: { [Op.substring]: search } }
                ]
            })
        }
        if (start) {
            condition.push({ reviewStar: start });
        }
        // Count All Review
        const totalReview = await YogaStudioReview.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Review
        const review = await YogaStudioReview.findAll({
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

exports.softDeleteYSReview = async (req, res) => {
    try {
        // find in database
        const review = await YogaStudioReview.findOne({
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

exports.updateYSReview = async (req, res) => {
    try {
        // Validate Body
        const { error } = reviewValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { reviewerName, reviewMessage, reviewStar } = req.body;
        // find in database
        const review = await YogaStudioReview.findOne({
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