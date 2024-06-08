const db = require('../../Models');
const { Op } = require("sequelize");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;

exports.restoreHomeTutor = async (req, res) => {
    try {
        // Find Home Tutor In Database
        const tutor = await HomeTutor.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!tutor) {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present in delete section!"
            });
        }
        if (tutor.deletedThrough === "Instructor" || tutor.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This home tutor is not deleted by Swasti!",
            });
        }
        await tutor.update({ deletedThrough: null });
        // Restore tutor
        await tutor.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreHTutorServiceArea = async (req, res) => {
    try {
        // Find Home Tutor service area In Database
        const area = await HTServiceArea.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!area) {
            return res.status(400).send({
                success: false,
                message: "This home tutor area is not present in delete section!"
            });
        }
        if (area.deletedThrough === "Instructor" || area.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This home tutor area is not deleted by Swasti!",
            });
        }
        await area.update({ deletedThrough: null });
        // Restore area
        await area.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor area restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreHTutorTimeSlote = async (req, res) => {
    try {
        // Find Home Tutor service slote In Database
        const slote = await HTTimeSlot.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!slote) {
            return res.status(400).send({
                success: false,
                message: "This home tutor slote is not present in delete section!"
            });
        }
        if (slote.deletedThrough === "Instructor" || slote.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This home tutor slote is not deleted by Swasti!",
            });
        }
        await slote.update({ deletedThrough: null });
        // Restore slote
        await slote.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor slote restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreHTutorImage = async (req, res) => {
    try {
        // Find Home Tutor service image In Database
        const image = await HTTimeSlot.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!image) {
            return res.status(400).send({
                success: false,
                message: "This home tutor image is not present in delete section!"
            });
        }
        if (image.deletedThrough === "Instructor" || image.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This home tutor image is not deleted by Swasti!",
            });
        }
        // find no. of current image
        const images = await HTutorImages.count({ where: { homeTutorId: image.homeTutorId, deletedThrough: null } });
        if (parseInt(image) < 3) {
            await image.update({ deletedThrough: null });
            // Restore image
            await image.restore();
            // Final Response
            res.status(200).send({
                success: true,
                message: "Home tutor image restored successfully!"
            });
        } else {
            res.status(400).send({
                success: false,
                message: "Home tutor image can not restore! There are already 3 image present"
            });
        }
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};