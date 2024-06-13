const db = require('../../Models');
const { Op } = require("sequelize");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;
const YogaStudioImage = db.yogaStudioImage;
const YSBusinessHistory = db.ySBusinessHistory;

// For Instructor
exports.getMyYogaStudioForInstructor = async (req, res) => {
    try {
        const yogaStudio = await YogaStudioBusiness.findAll({
            where: {
                instructorId: req.instructor.id
            },
            include: [{
                model: YogaStudioContact,
                as: 'contacts',
                where: {
                    deletedThrough: null
                },
                required: false
            }, {
                model: YogaStudioImage,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: YogaStudioTime,
                as: 'timings',
                where: {
                    deletedThrough: null
                },
                required: false
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        })
        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: yogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioForAdmin = async (req, res) => {
    try {
        const { page, limit, search, approvalStatusByAdmin } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        const condition = [];
        if (approvalStatusByAdmin) {
            condition.push({ approvalStatusByAdmin: approvalStatusByAdmin });
        }
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { businessName: { [Op.substring]: search } },
                    { city: { [Op.substring]: search } },
                    { state: { [Op.substring]: search } },
                    { pincode: { [Op.substring]: search } },
                    { street_colony: { [Op.substring]: search } }
                ]
            })
        }
        // Count All studio
        const totalStudio = await YogaStudioBusiness.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All studio
        const studio = await YogaStudioBusiness.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All studio fetched fetched successfully!",
            totalPage: Math.ceil(totalStudio / recordLimit),
            currentPage: currentPage,
            data: studio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioById = async (req, res) => {
    try {
        let condition = {
            id: req.params.id
        };
        if (req.instructor) {
            condition = {
                id: req.params.id,
                instructorId: req.instructor.id
            };
        }
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: condition,
            include: [{
                model: YogaStudioContact,
                as: 'contacts',
                where: {
                    deletedThrough: null
                },
                required: false
            }, {
                model: YogaStudioImage,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: YogaStudioTime,
                as: 'timings',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        })
        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: yogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioForUser = async (req, res) => {
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
        const condition = [
            { approvalStatusByAdmin: "Approved" }, { isPublish: true }, { deletedThrough: null }];
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { businessName: { [Op.substring]: search } },
                    { city: { [Op.substring]: search } },
                    { state: { [Op.substring]: search } },
                    { pincode: { [Op.substring]: search } },
                    { street_colony: { [Op.substring]: search } }
                ]
            })
        }
        // Count All studio
        const totalStudio = await YogaStudioBusiness.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All studio
        const studio = await YogaStudioBusiness.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All studio fetched fetched successfully!",
            totalPage: Math.ceil(totalStudio / recordLimit),
            currentPage: currentPage,
            data: studio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioByIdUser = async (req, res) => {
    try {
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                approvalStatusByAdmin: "Approved",
                isPublish: true,
                deletedThrough: null
            },
            include: [{
                model: YogaStudioContact,
                as: 'contacts',
                where: {
                    deletedThrough: null,
                    approvalStatusByAdmin: "Approved"
                },
                required: false
            }, {
                model: YogaStudioImage,
                as: 'images',
                where: {
                    deletedThrough: null,
                    approvalStatusByAdmin: "Approved"
                },
                required: false
            },
            {
                model: YogaStudioTime,
                as: 'timings',
                where: {
                    deletedThrough: null,
                    approvalStatusByAdmin: "Approved"
                },
                required: false
            }]
        });
        if (!yogaStudio) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }

        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: yogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};