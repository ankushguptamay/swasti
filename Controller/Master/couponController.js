const db = require('../../Models');
const { Op } = require("sequelize");
const { courseCouponValidation } = require('../../Middleware/Validate/validateMaster');
const { changeQualificationStatus } = require("../../Middleware/Validate/validateInstructor");
const Coupon = db.coupon;
const Instructor = db.instructor;

exports.createCoupon = async (req, res) => {
    try {
        // Validate Body
        const { error } = courseCouponValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { couponTitle, discountInPercent, validTill } = req.body;
        // generate Coupon code
        let code;
        const isCoupon = await Coupon.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isCoupon.length == 0) {
            code = "DISC" + 1000;
        } else {
            let lastCode = isCoupon[isCoupon.length - 1];
            let lastDigits = lastCode.couponNumber.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "DISC" + incrementedDigits;
        }
        if (req.instructor) {
            await Coupon.create({
                couponTitle: couponTitle,
                discountInPercent: discountInPercent,
                couponNumber: code,
                createrId: req.instructor.id,
                creater: "Instructor",
                validTill: validTill,
                approvalStatusByAdmin: "Pending"
            });
        } else if (req.admin) {
            await Coupon.create({
                couponTitle: couponTitle,
                discountInPercent: discountInPercent,
                couponNumber: code,
                createrId: req.admin.id,
                creater: "Admin",
                validTill: validTill,
                approvalStatusByAdmin: "Approved"
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not created coupon!"
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllCouponForAdmin = async (req, res) => {
    try {
        const { page, limit, search, approval } = req.query;
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
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { couponTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { couponNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count coupon
        const totalCoupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course
        const coupon = await Coupon.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon for approval fetched successfully!",
            totalPage: Math.ceil(totalCoupon / recordLimit),
            currentPage: currentPage,
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteCoupon = async (req, res) => {
    try {
        let deletedThrough, condition, message;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                createrId: req.instructor.id
            }
            deletedThrough = "Instructor";
            message = "deleted";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            }
            deletedThrough = "Admin";
            message = "soft deleted";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not authorized!"
            });
        }
        // Find In database
        const coupon = await Coupon.findOne({
            where: condition
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present!'
            });
        }
        // update deletedThrough
        await coupon.update({ ...coupon, deletedThrough: deletedThrough });
        // soft delete coupon
        await coupon.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Coupon ${message} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreCoupon = async (req, res) => {
    try {
        // Find In database
        const coupon = await Coupon.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present in soft delete!'
            });
        }
        if (coupon.deletedThrough === "Instructor" || coupon.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This Course is not deleted by Swasti!",
            });
        }
        // update deletedThrough
        await coupon.update({ ...coupon, deletedThrough: null });
        //  restore coupon
        await coupon.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllInstructorCoupon = async (req, res) => {
    try {
        const { search, approval } = req.query;

        // Search 
        const condition = [{ createrId: req.instructor.id }];
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { couponTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { couponNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count coupon
        const totalCoupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Coupon
        const coupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon fetched successfully!",
            totalPage: Math.ceil(totalCoupon / recordLimit),
            currentPage: currentPage,
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeCouponStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Find In database
        const coupon = await Coupon.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present!'
            });
        }
        // update coupon
        await coupon.update({
            ...coupon,
            approvalStatusByAdmin: req.body.approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Coupon ${req.body.approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllSoftDeletedCoupon = async (req, res) => {
    try {
        const { page, limit, search, approval } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [{ deletdAt: { [Op.ne]: null } }];
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { couponTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { couponNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count coupon
        const totalCoupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        // Get All Course
        const coupon = await Coupon.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Soft deleted coupon fetched successfully!",
            totalPage: Math.ceil(totalCoupon / recordLimit),
            currentPage: currentPage,
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCouponById = async (req, res) => {
    try {
        // Find In database
        const coupon = await Coupon.findOne({
            where: {
                id: req.params.id
            },
            paranoid: false
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present!'
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon fetched successfully!",
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};