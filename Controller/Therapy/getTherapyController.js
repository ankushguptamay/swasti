const db = require('../../Models');
const { Op } = require("sequelize");
const Therapy = db.therapy;
const TherapyHistory = db.therapyHistory;
const TherayImages = db.therapyImage;
const TherapyOffered = db.therapyOffered;
const TherapyServiceArea = db.therapyServiceArea;
const TherapyTimeSlot = db.therapyTimeSlote;


exports.getMyTherapyForInstructor = async (req, res) => {
    try {
        const therapy = await Therapy.findAll({
            where: {
                instructorId: req.instructor.id,
                deletedThrough: null
            },
            include: [{
                model: TherapyServiceArea,
                as: 'serviceAreas',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: TherapyTimeSlot,
                as: 'timeSlotes',
                where: {
                    deletedThrough: null
                },
                attributes: { exclude: ['password'] },
                required: false
            }, {
                model: TherayImages,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            }, {
                model: TherapyOffered,
                as: 'therapyTypeOffered',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy fetched successfully!",
            data: therapy
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getTherapyForAdmin = async (req, res) => {
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
        // if (search) {
        //     condition.push({
        //         [Op.or]: [
        //             {}
        //         ]
        //     })
        // }
        // Count All Therapy
        const totalTherapy = await Therapy.count({
            where: {
                [Op.and]: condition
            }
        });
        const therapy = await Therapy.findAll({
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
            message: "Therapy fetched successfully!",
            totalPage: Math.ceil(totalTherapy / recordLimit),
            currentPage: currentPage,
            data: therapy
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// Admin and Instructor all not deleted
exports.getTherapyById = async (req, res) => {
    try {
        const therapy = await Therapy.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            },
            include: [{
                model: TherapyServiceArea,
                as: 'serviceAreas',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: TherapyTimeSlot,
                as: 'timeSlotes',
                where: {
                    deletedThrough: null
                },
                attributes: { exclude: ['password'] },
                required: false
            }, {
                model: TherayImages,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            }, {
                model: TherapyOffered,
                as: 'therapyTypeOffered',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy fetched successfully!",
            data: therapy
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};
