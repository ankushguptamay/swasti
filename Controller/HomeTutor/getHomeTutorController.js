const db = require('../../Models');
const { Op } = require("sequelize");
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
exports.getMyHomeTutorById = async (req, res) => {
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

exports.getMyHTutorUpdationRequestById = async (req, res) => {
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