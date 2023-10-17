const db = require('../../Models');
const { Op } = require("sequelize");
const { courseDiscountValidation } = require('../../Middleware/Validate/validateMaster');
const Discount = db.discount;
const Instructor = db.instructor;

exports.createDiscount = async (req, res) => {
    try {
        // Validate Body
        const { error } = courseDiscountValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { discountTitle, discountInPercent } = req.body;
        // generate Discount code
        let code;
        const isDiscount = await Discount.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isDiscount.length == 0) {
            code = "DISC" + 1000;
        } else {
            let lastCode = isDiscount[isDiscount.length - 1];
            let lastDigits = lastCode.discountNumber.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "DISC" + incrementedDigits;
        }
        if (req.instructor) {
            await Discount.create({
                discountTitle: discountTitle,
                discountInPercent: discountInPercent,
                discountNumber: code,
                createrId: req.instructor.id,
                approvalStatusByAdmin: "Pending"
            });
        } else if (req.admin) {
            await Discount.create({
                discountTitle: discountTitle,
                discountInPercent: discountInPercent,
                discountNumber: code,
                createrId: req.admin.id,
                approvalStatusByAdmin: "Approved"
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not created discount!"
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllDiscountForApproval = async (req, res) => {
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
                    { discountTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { discountNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count discount
        const totalDiscount = await Discount.findAll({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course
        const discount = await Discount.findAll({
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
            message: "Discount for approval fetched successfully!",
            totalPage: Math.ceil(totalDiscount / recordLimit),
            currentPage: currentPage,
            data: discount
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteDiscount = async (req, res) => {
    try {
        // Find In database
        const isDiscount = await Discount.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isDiscount) {
            return res.status(400).send({
                success: false,
                message: 'This discount is not present!'
            });
        }
        // soft delete discount
        await isDiscount.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.hardDeleteDiscount = async (req, res) => {
    try {
        // Find In database
        const isDiscount = await Discount.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!isDiscount) {
            return res.status(400).send({
                success: false,
                message: 'This discount is not present in soft delete!'
            });
        }
        // hard delete discount
        await isDiscount.destroy({ force: true });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreDiscount = async (req, res) => {
    try {
        // Find In database
        const isDiscount = await Discount.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!isDiscount) {
            return res.status(400).send({
                success: false,
                message: 'This discount is not present in soft delete!'
            });
        }
        //  restore discount
        await isDiscount.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllInstructorDiscount = async (req, res) => {
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
        const condition = [{ createrId: req.instructor.id }];
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { discountTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { discountNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count discount
        const totalDiscount = await Discount.findAll({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course
        const discount = await Discount.findAll({
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
            message: "Discount fetched successfully!",
            totalPage: Math.ceil(totalDiscount / recordLimit),
            currentPage: currentPage,
            data: discount
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.approveDiscount = async (req, res) => {
    try {
        // Find In database
        const isDiscount = await Discount.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isDiscount) {
            return res.status(400).send({
                success: false,
                message: 'This discount is not present!'
            });
        }
        // update discount
        await isDiscount.update({
            ...isDiscount,
            approvalStatusByAdmin: "Approved"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount approved successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.rejectDiscount = async (req, res) => {
    try {
        // Find In database
        const isDiscount = await Discount.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isDiscount) {
            return res.status(400).send({
                success: false,
                message: 'This discount is not present!'
            });
        }
        // update discount
        await isDiscount.update({
            ...isDiscount,
            approvalStatusByAdmin: "Rejected"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount rejected successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllDeletedDiscount = async (req, res) => {
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
                    { discountTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { discountNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count discount
        const totalDiscount = await Discount.findAll({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        // Get All Course
        const discount = await Discount.findAll({
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
            message: "Soft deleted discount fetched successfully!",
            totalPage: Math.ceil(totalDiscount / recordLimit),
            currentPage: currentPage,
            data: discount
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getDiscountById = async (req, res) => {
    try {
        // Find In database
        const isDiscount = await Discount.findOne({
            where: {
                id: req.params.id
            },
            paranoid: false
        });
        if (!isDiscount) {
            return res.status(400).send({
                success: false,
                message: 'This discount is not present!'
            });
        }
        const instructor = await Instructor.findOne({
            where: { id: isDiscount.createrId }
        });
        let creater = "Admin";
        if (instructor) {
            creater = instructor.name
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Discount fetched successfully!",
            data: {
                id: isDiscount.id,
                discountTitle: isDiscount.discountTitle,
                discountInPercent: isDiscount.discountInPercent,
                discountNumber: isDiscount.code,
                createrId: isDiscount.createrId,
                approvalStatusByAdmin: isDiscount.approvalStatusByAdmin,
                creater: creater,
                createdAt: isDiscount.createdAt
            }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};