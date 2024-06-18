const db = require('../../Models');
const { Op } = require("sequelize");
const { getHomeTutorForUserValidation } = require('../../Middleware/Validate/validateHomeTutor');
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;


exports.getMyHomeTutorForInstructor = async (req, res) => {
    try {
        const homeTutor = await HomeTutor.findAll({
            where: {
                instructorId: req.instructor.id,
                deletedThrough: null
            },
            include: [{
                model: HTServiceArea,
                as: 'serviceAreas',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: HTTimeSlot,
                as: 'timeSlotes',
                where: {
                    deletedThrough: null
                },
                attributes: { exclude: ['password'] },
                required: false
            }, {
                model: HTutorImages,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor fetched successfully!",
            data: homeTutor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getHomeTutorForAdmin = async (req, res) => {
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
        // Count All Home Tutor
        const totalTutor = await HomeTutor.count({
            where: {
                [Op.and]: condition
            }
        });
        const homeTutor = await HomeTutor.findAll({
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
            message: "Home tutor fetched successfully!",
            totalPage: Math.ceil(totalTutor / recordLimit),
            currentPage: currentPage,
            data: homeTutor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// Admin and Instructor all not deleted
exports.getHomeTutorById = async (req, res) => {
    try {
        const homeTutor = await HomeTutor.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            },
            include: [{
                model: HTServiceArea,
                as: 'serviceAreas',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: HTTimeSlot,
                as: 'timeSlotes',
                where: {
                    deletedThrough: null
                },
                attributes: { exclude: ['password'] },
                required: false
            }, {
                model: HTutorImages,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor fetched successfully!",
            data: homeTutor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getHTutorUpdationRequestById = async (req, res) => {
    try {
        const homeTutorHistory = await HomeTutorHistory.findAll({
            where: {
                homeTutorId: req.params.id,
                updationStatus: "Pending"
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor updation request fetched successfully!",
            data: homeTutorHistory
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getHomeTutorForUser = async (req, res) => {
    try {
        // Validate Body
        const { error } = getHomeTutorForUserValidation(req.query);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { page, limit, search, price, isPersonal, isGroup, perDay, monthly, language, latitude, longitude, experience } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        const condition = [{ approvalStatusByAdmin: "Approved" }, { isPublish: true }];
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { homeTutorName: { [Op.substring]: search } }
                ]
            });
        }
        // Filter
        if (language) {
            condition.push({ language: { [Op.contains]: language } });
        }
        if (isPersonal) {
            condition.push({ isPrivateSO: isPersonal });
        }
        if (isGroup) {
            condition.push({ isGroupSO: isGroup });
        }
        if (price) {
            condition.push({
                [Op.or]: [
                    { privateSessionPrice_Day: { [Op.lte]: parseFloat(price) } },
                    { privateSessionPrice_Month: { [Op.lte]: parseFloat(price) } },
                    { groupSessionPrice_Day: { [Op.lte]: parseFloat(price) } },
                    { groupSessionPrice_Month: { [Op.lte]: parseFloat(price) } }
                ]
            });
        }
        // Location
        if (latitude && longitude) {
            const unit = 'km'; // km for kilometer m for mile
            const distance = 20;
            const totalLocation = await HTServiceArea.scope({
                method: ['distance', parseFloat(latitude), parseFloat(longitude), distance, unit]
            })
                .findAll({
                    attributes: [
                        'id', "locationName", "latitude", "longitude", "homeTutorId"
                    ],
                    order: db.sequelize.col('distance')
                });
            const tutorId = [];
            for (let i = 0; i < totalLocation.length; i++) {
                tutorId.push(totalLocation.homeTutorId);
            }
            condition.push({ id: tutorId });
        }
        // Count All Home Tutor
        const totalTutor = await HomeTutor.count({
            where: {
                [Op.and]: condition
            }
        });
        const homeTutor = await HomeTutor.findAll({
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
            message: "Home tutor fetched successfully!",
            totalPage: Math.ceil(totalTutor / recordLimit),
            currentPage: currentPage,
            data: homeTutor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getNearestHomeTutorForUser = async (req, res) => {
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
        const totalAreas = await HTServiceArea.scope({
            method: ['distance', latitude, longitude, distance, unit]
        })
            .findAll({
                attributes: [
                    'id', "locationName", "latitude", "longitude",
                ],
                order: db.sequelize.col('distance')
            });
        // Find Areas
        const areas = await HTServiceArea.scope({
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
                    model: HomeTutor,
                    as: 'homeTutors',
                    where: { approvalStatusByAdmin: "Approved", isPublish: true }
                }]
            });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor fetched successfully!",
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

exports.getHomeTutorByIdForUser = async (req, res) => {
    try {
        const date = JSON.stringify(new Date());
        const todayDate = date.slice(1, 11);
        const homeTutor = await HomeTutor.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null,
                approvalStatusByAdmin: "Approved",
                isPublish: true
            },
            include: [{
                model: HTServiceArea,
                as: 'serviceAreas',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: HTTimeSlot,
                as: 'timeSlotes',
                where: {
                    deletedThrough: null,
                    date: todayDate
                },
                required: false
            }, {
                model: HTutorImages,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor fetched successfully!",
            data: homeTutor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getHTTimeSloteForUser = async (req, res) => {
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
        const slote = await HTTimeSlot.findAll({
            where: {
                homeTutorId: req.params.id,
                deletedThrough: null,
                date: dateCondition
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor Time slote fetched successfully!",
            data: slote
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};