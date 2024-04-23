const db = require('../../Models');
const { Op } = require("sequelize");
const { university_instituteValidation } = require('../../Middleware/Validate/validateMaster');
const University_Institute = db.university_institute;
const capitalize = require("../../Util/capitalizeFirstLetter")

exports.createUniversity_Institute = async (req, res) => {
    try {
        // Validate Body
        const { error } = university_instituteValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check duplicacy
        const university_institute_name = capitalize(req.body.university_institute_name);
        const isPresent = await University_Institute.findOne({
            where: {
                university_institute_name: university_institute_name
            }
        });
        if (isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This university/institute name is present!'
            });
        }
        // create university_institute_name
        await University_Institute.create({
            university_institute_name: university_institute_name
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "University/Institute name created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllUniversity_Institute = async (req, res) => {
    try {
        const university_institute = await University_Institute.findAll();
        // Final Response
        res.status(200).send({
            success: true,
            message: "University/Institute fetched successfully!",
            data: university_institute
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteUniversity_Institute = async (req, res) => {
    try {
        // Find In database
        const isPresent = await University_Institute.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This University/Institute is not present!'
            });
        }
        // delete university_institute
        await isPresent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "University/Institute deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};