const db = require('../../Models');
const { Op } = require("sequelize");
const { therapyTypeValidation } = require('../../Middleware/Validate/validateMaster');
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const TherapyType = db.therapyType;

exports.addTherapyType = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapyTypeValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check duplicacy
        const therapyType = capitalizeFirstLetter(req.body.therapyType);
        const isPresent = await TherapyType.findOne({
            where: {
                therapyType: therapyType
            }
        });
        if (isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This therapy type is present!'
            });
        }
        // create Therapy Type
        await TherapyType.create({
            therapyType: therapyType
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy type created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllTherapyType = async (req, res) => {
    try {
        const type = await TherapyType.findAll();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy type fetched successfully!",
            data: type
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteTherapyType = async (req, res) => {
    try {
        // Find In database
        const isPresent = await TherapyType.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This therapy type is not present!'
            });
        }
        // delete Therapy type
        await isPresent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy type deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};