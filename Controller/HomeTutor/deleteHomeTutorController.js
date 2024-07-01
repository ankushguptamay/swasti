const db = require('../../Models');
const { Op } = require("sequelize");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;

// Hard delete api is not make becasuse of payment

exports.softDeleteHomeTutor = async (req, res) => {
    try {
        let deletedThrough, condition;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                instructorId: req.instructor.id
            };
            deletedThrough = "Instructor";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            };
            deletedThrough = "Admin";
        } else {
            res.status(400).send({
                success: false,
                message: "You can not delete this home tutor!"
            });
        }
        // Find Home Tutor In Database
        const tutor = await HomeTutor.findOne({
            where: condition
        });
        if (!tutor) {
            return res.status(400).send({
                success: false,
                message: "Home tutor is not present!"
            });
        }
        await tutor.update({ deletedThrough: deletedThrough });
        // Soft Delete
        await tutor.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteHTutorServiceArea = async (req, res) => {
    try {
        let deletedThrough;
        if (req.instructor) {
            deletedThrough = "Instructor";
        } else if (req.admin) {
            deletedThrough = "Admin";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not delete this home tutor!"
            });
        }
        // Find Home Tutor service area In Database
        const area = await HTServiceArea.findOne({
            where: { id: req.params.id }
        });
        if (!area) {
            return res.status(400).send({
                success: false,
                message: "Home tutor area is not present!"
            });
        }
        // Find All Service Area
        const totalArea = await HTServiceArea.count({
            where: { id: req.params.id }
        });
        if (parseInt(totalArea) <= 1) {
            return res.status(400).send({
                success: false,
                message: "There should be at least one service area present!"
            });
        }
        await area.update({ deletedThrough: deletedThrough });
        // Soft Delete
        await area.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor area deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteHTutorImage = async (req, res) => {
    try {
        let deletedThrough;
        if (req.instructor) {
            deletedThrough = "Instructor";
        } else if (req.admin) {
            deletedThrough = "Admin";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not delete this home tutor!"
            });
        }
        // Find Home Tutor images In Database
        const images = await HTutorImages.findOne({
            where: { id: req.params.id }
        });
        if (!images) {
            return res.status(400).send({
                success: false,
                message: "Home tutor images is not present!"
            });
        }
        // Find All Images
        const totalImages = await HTutorImages.count({
            where: { id: req.params.id }
        });
        if (parseInt(totalImages) <= 1) {
            return res.status(400).send({
                success: false,
                message: "There should be at least one image present!"
            });
        }
        await images.update({ deletedThrough: deletedThrough });
        // Soft Delete
        await images.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor images deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteHTutorTimeSlote = async (req, res) => {
    try {
        let deletedThrough;
        if (req.instructor) {
            deletedThrough = "Instructor";
        } else if (req.admin) {
            deletedThrough = "Admin";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not delete this home tutor!"
            });
        }
        // Find Home Tutor time slote In Database
        const slote = await HTTimeSlot.findOne({
            where: { id: req.params.id }
        });
        if (!slote) {
            return res.status(400).send({
                success: false,
                message: "Home tutor slote is not present!"
            });
        }
        if (slote.isBooked === true) {
            return res.status(400).send({
                success: false,
                message: "Home tutor slote is booked! You can not delete this slote!"
            });
        }
        await slote.update({ deletedThrough: deletedThrough });
        // Soft Delete
        await slote.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor slote deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};