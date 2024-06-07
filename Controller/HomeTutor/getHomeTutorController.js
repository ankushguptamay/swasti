const db = require('../../Models');
const { Op } = require("sequelize");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;

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