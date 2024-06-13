const db = require('../../Models');
const { Op } = require("sequelize");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;
const YogaStudioImage = db.yogaStudioImage;
const YSBusinessHistory = db.ySBusinessHistory;

exports.restoreYogaStudioBusiness = async (req, res) => {
    try {
        let condition = {
            id: req.params.id,
            deletedAt: { [Op.ne]: null }
        };
        // Find business In Database
        const business = await YogaStudioBusiness.findOne({
            where: condition,
            paranoid: false
        });
        if (!business) {
            return res.status(400).send({
                success: false,
                message: "This studio is not present!"
            });
        }
        if (business.deletedThrough === "Instructor" || business.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: false,
                message: `Can not restore this business!`
            });
        }
        // update business
        await business.update({
            ...business,
            deletedThrough: null
        });
        // restore business
        await business.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio business restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreYogaStudioImage = async (req, res) => {
    try {
        let condition = {
            id: req.params.id,
            deletedAt: { [Op.ne]: null }
        };
        // Find image In Database
        const image = await YogaStudioImage.findOne({
            where: condition,
            paranoid: false
        });
        if (!image) {
            return res.status(400).send({
                success: false,
                message: "This studio image is not present!"
            });
        }
        if (image.deletedThrough === "Instructor" || image.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: false,
                message: `Can not restore this image!`
            });
        }
        // update image
        await image.update({
            ...image,
            deletedThrough: null
        });
        // restore image
        await image.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio image restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreYogaStudioContact = async (req, res) => {
    try {
        let condition = {
            id: req.params.id,
            deletedAt: { [Op.ne]: null }
        };
        // Find contact In Database
        const contact = await YogaStudioContact.findOne({
            where: condition,
            paranoid: false
        });
        if (!contact) {
            return res.status(400).send({
                success: false,
                message: "This studio is not present!"
            });
        }
        if (contact.deletedThrough === "Instructor" || contact.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: false,
                message: `Can not restore this contact successfully!`
            });
        }
        // update contact
        await contact.update({
            ...contact,
            deletedThrough: null
        });
        // restore business
        await contact.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio contact restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreYogaStudioTime = async (req, res) => {
    try {
        let condition = {
            id: req.params.id,
            deletedAt: { [Op.ne]: null }
        };
        // Find time In Database
        const time = await YogaStudioTime.findOne({
            where: condition,
            paranoid: false
        });
        if (!time) {
            return res.status(400).send({
                success: false,
                message: "This studio time is not present!"
            });
        }
        if (time.deletedThrough === "Instructor" || time.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: false,
                message: `Can not restore this time successfully!`
            });
        }
        // update time
        await time.update({
            ...time,
            deletedThrough: null
        });
        // restore business
        await time.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio time restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};