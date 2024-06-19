const db = require('../../Models');
const { Op } = require("sequelize");
const { therapySpecilizationValidation } = require('../../Middleware/Validate/validateMaster');
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const TherapySpecilization = db.therapySpecilization;

exports.createTherapySpecilization = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapySpecilizationValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check duplicacy
        const specilization = capitalizeFirstLetter(req.body.specilization);
        const isPresent = await TherapySpecilization.findOne({
            where: {
                specilization: specilization
            }
        });
        if (isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This therapy specilization is present!'
            });
        }
        // create specilization
        await TherapySpecilization.create({
            specilization: specilization
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy Specilization created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllTherapySpecilization = async (req, res) => {
    try {
        const specilization = await TherapySpecilization.findAll();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy Specilization fetched successfully!",
            data: specilization
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteTherapySpecilization = async (req, res) => {
    try {
        // Find In database
        const isPresent = await TherapySpecilization.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This therapy specilization is not present!'
            });
        }
        // delete Therapy Specilization
        await isPresent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy specilization deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};