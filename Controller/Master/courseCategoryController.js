const db = require('../../Models');
const { Op } = require("sequelize");
const { courseCategoryValidation } = require('../../Middleware/Validate/validateMaster');
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const CourseCategories = db.courseCategory;

exports.createCourseCategory = async (req, res) => {
    try {
        // Validate Body
        const { error } = courseCategoryValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check duplicacy
        const categoryName = capitalizeFirstLetter(req.body.categoryName);
        const isPresent = await CourseCategories.findOne({
            where: {
                categoryName: categoryName
            }
        });
        if (isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This course category is present!'
            });
        }
        // generate Category code
        let code;
        const isCategory = await CourseCategories.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isCategory.length == 0) {
            code = "COCA" + 1000;
        } else {
            let lastCode = isCategory[isCategory.length - 1];
            let lastDigits = lastCode.courseCategoryNumber.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "COCA" + incrementedDigits;
        }
        // create Course category
        await CourseCategories.create({
            courseCategoryNumber: code,
            categoryName: categoryName
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course category created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllCourseCategory = async (req, res) => {
    try {
        const category = await CourseCategories.findAll();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course category fetched successfully!",
            data: category
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteCourseCategory = async (req, res) => {
    try {
        // Find In database
        const isPresent = await CourseCategories.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!isPresent) {
            return res.status(400).send({
                success: false,
                message: 'This course category is not present!'
            });
        }
        // delete Course category
        await isPresent.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Course category deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};