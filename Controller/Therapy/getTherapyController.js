const db = require('../../Models');
const { Op } = require("sequelize");
const Therapy = db.therapy;
const TherapyHistory = db.therapyHistory;
const TherapyImages = db.therapyImage;
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
                model: TherapyImages,
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
                model: TherapyImages,
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

exports.getTherapyForUser = async (req, res) => {
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
        const condition = [{ deletedThrough: null }];
        // Search
        // if (search) {
        //     condition.push({
        //         [Op.or]: [
        //             {}
        //         ]
        //     })
        // }
        // Count All TherapyOffered
        const totalTherapyOffered = await TherapyOffered.count({
            where: {
                [Op.and]: condition
            }
        });
        const therapiesOffered = await TherapyOffered.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            include: [{
                model: Therapy,
                as: 'therapies',
                where: {
                    deletedThrough: null, approvalStatusByAdmin: "Approved", isPublish: true
                },
                required: true
            }],
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy fetched successfully!",
            totalPage: Math.ceil(totalTherapyOffered / recordLimit),
            currentPage: currentPage,
            data: therapiesOffered
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getNearestTherapyForUser = async (req, res) => {
    try {
        const { page, limit, latitude, longitude, distanceUnit, areaDistance } = req.query;
        if (!latitude && !longitude) {
            return res.status(400).send({
                success: false,
                message: "Location is required!"
            });
        }
        const unit = distanceUnit ? distanceUnit : 'km'; // km for kilometer m for mile
        const distance = areaDistance ? areaDistance : 2;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Count All Areas
        const totalAreas = await await TherapyServiceArea.scope({
            method: ['distance', latitude, longitude, distance, unit]
        })
            .findAll({
                attributes: [
                    'id', "locationName", "latitude", "longitude",
                ],
                order: db.sequelize.col('distance')
            });
        // Find Areas
        const areas = await TherapyServiceArea.scope({
            method: ['distance', latitude, longitude, distance, unit]
        })
            .findAll({
                attributes: [
                    'id', "locationName", "latitude", "longitude",
                ],
                order: db.sequelize.col('distance'),
                limit: recordLimit,
                offset: offSet,
                include: [{
                    model: Therapy,
                    as: 'therapies',
                    where: { approvalStatusByAdmin: "Approved", isPublish: true, deletedThrough: null }
                }]
            });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapist fetched successfully!",
            totalPage: Math.ceil(totalAreas.length / recordLimit),
            currentPage: currentPage,
            data: areas
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getTherapistByIdForUser = async (req, res) => {
    try {
        const date = JSON.stringify(new Date());
        const todayDate = date.slice(1, 11);
        const therapy = await Therapy.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null,
                approvalStatusByAdmin: "Approved",
                isPublish: true
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
                    deletedThrough: null,
                    date: todayDate
                },
                required: false
            }, {
                model: TherapyImages,
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
            message: "Therapist fetched successfully!",
            data: therapy
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getTherapyTimeSloteForUser = async (req, res) => {
    try {
        const { date } = req.query;
        // 3 days validity
        const date1 = JSON.stringify(new Date());
        const date2 = JSON.stringify(new Date((new Date).getTime() + (1 * 24 * 60 * 60 * 1000)));
        const date3 = JSON.stringify(new Date((new Date).getTime() + (2 * 24 * 60 * 60 * 1000)));
        let dateCondition;
        if (date) {
            const array = [`${date1.slice(1, 11)}`, `${date2.slice(1, 11)}`, `${date3.slice(1, 11)}`]
            if (array.indexOf(date) === -1) {
                return res.status(400).send({
                    success: false,
                    message: "Date should be with in required limit!"
                });
            } else {
                dateCondition = date;
            }
        } else {
            dateCondition = date1.slice(1, 11);
        }
        const slote = await TherapyTimeSlot.findAll({
            where: {
                therapyId: req.params.id,
                deletedThrough: null,
                date: dateCondition
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy Time slote fetched successfully!",
            data: slote
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};