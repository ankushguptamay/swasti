const db = require('../../Models');
const { Op } = require("sequelize");
const { changeQualificationStatus, changePublish, changeHTTimeSloteStatus } = require("../../Middleware/Validate/validateInstructor");
const Instructor = db.instructor;
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;

exports.submitHomeTutorForApproval = async (req, res) => {
    try {
        const instructorId = req.instructor.id;

        // Find Home tutor In Database
        const tutor = await HomeTutor.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId,
                approvalStatusByAdmin: null
            }
        });
        if (!tutor) {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present!"
            });
        }

        // Update Home tutor
        await tutor.update({
            ...tutor,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Home tutor successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeHomeTutorStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find Tutor In Database
        const tutor = await HomeTutor.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!tutor) {
            return res.status(400).send({
                success: false,
                message: "This Home tutor is not present!"
            });
        }
        if (approvalStatusByAdmin === "Approved") {
            await Instructor.update({ bio: tutor.instructorBio }, { where: { id: tutor.instructorId } });
        }
        // Update tutor
        await tutor.update({
            ...tutor,
            approvalStatusByAdmin: approvalStatusByAdmin,
            anyUpdateRequest: false
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Home tutor ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.publishHomeTutor = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePublish(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPublish } = req.body;
        const instructorId = req.instructor.id;
        // Change message
        let message = "unpublish";
        if (isPublish === true) {
            message = "publish";
        }
        // Find Tutor In Database
        const tutor = await HomeTutor.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId
            }
        });
        if (!tutor) {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present!"
            });
        }
        if (tutor.approvalStatusByAdmin !== "Approved") {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not approved!"
            });
        }
        // Update tutor
        await tutor.update({
            ...tutor,
            isPublish: isPublish
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Home tutor ${message} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeHTTimeSloteStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeHTTimeSloteStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { appointmentStatus, password } = req.body;
        // Find slote In Database
        const slote = await HTTimeSlot.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            }
        });
        if (!slote) {
            return res.status(400).send({
                success: false,
                message: "This slote is not present!"
            });
        }
        if (parseInt(password) === slote.password) {
            // Update slote
            await slote.update({
                ...slote,
                appointmentStatus: appointmentStatus
            });
            // Final Response
            res.status(200).send({
                success: true,
                message: `Home slote ${appointmentStatus} successfully!`
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "Invalid password!"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};