const db = require('../../Models');
const { Op } = require("sequelize");
const { therapySpecilizationValidation } = require('../../Middleware/Validate/validateMaster');
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const HTSpecilization = db.hTSpecilization;

exports.addHTSpecilization = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapySpecilizationValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check duplicacy
        const specilization = capitalizeFirstLetter(req.body.specilization);
        const isPresent = await HTSpecilization.findOne({
            where: {
                specilization: specilization
            }
        });
        if (isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This home tutor specilization is present!'
            });
        }
        // create specilization
        await HTSpecilization.create({
            specilization: specilization
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor Specilization created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllHTSpecilization = async (req, res) => {
    try {
        const specilization = await HTSpecilization.findAll();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor Specilization fetched successfully!",
            data: specilization
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteHTSpecilization = async (req, res) => {
    try {
        // Find In database
        const isPresent = await HTSpecilization.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This home tutor specilization is not present!'
            });
        }
        // delete home tutor Specilization
        await isPresent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home tutor specilization deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};