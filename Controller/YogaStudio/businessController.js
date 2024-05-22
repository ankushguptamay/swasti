const db = require('../../Models');
const { Op } = require("sequelize");
const { createBusiness } = require('../../Middleware/Validate/validateYogaStudio');
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const { required } = require('joi');
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioImage = db.yogaStudioImage;
const YogaStudioTime = db.yogaStudioTiming
const YSBusinessHistory = db.ySBusinessHistory;

// createYogaStudioBusiness
// getMyYogaStudio for instructor/admin
// getYogaStudioForAdmin
// getYogaStudioById for instructor/admin
// getYogaStudioForUser
// getYogaStudioByIdUser
// updateYogaStudio

exports.createYogaStudioBusiness = async (req, res) => {
    try {
        // Validate Body
        const { error } = createBusiness(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { block_building, street_colony, pincode, area, landmark, city, state } = req.body;
        const businessName = capitalizeFirstLetter(req.body.businessName);
        let createrId, creater, approvalStatusByAdmin, updationStatus;
        if (req.instructor) {
            createrId = req.instructor.id;
            creater = "Instructor";
            approvalStatusByAdmin = "Pending";
            updationStatus = "Pending";
        } else if (req.admin) {
            createrId = req.admin.id
            creater = "Admin";
            approvalStatusByAdmin = "Approved";
            updationStatus = "Approved";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not created Yoga studio!"
            });
        }
        const business = await YogaStudioBusiness.create({
            businessName: businessName,
            block_building: block_building,
            street_colony: street_colony,
            pincode: pincode,
            state: state,
            city: city,
            landmark: landmark,
            area: area,
            createrId: createrId,
            creater: creater,
            approvalStatusByAdmin: approvalStatusByAdmin
        });

        await YSBusinessHistory.create({
            businessName: businessName,
            block_building: block_building,
            street_colony: street_colony,
            pincode: pincode,
            state: state,
            city: city,
            landmark: landmark,
            area: area,
            createrId: createrId,
            creater: creater,
            updationStatus: updationStatus,
            businessId: business.id
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Submit successfully!",
            data: {
                id: business.id
            }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Instructor and admin
exports.getMyYogaStudio = async (req, res) => {
    try {
        let consdition = {
            createrId: req.instructor.id,
            creater: "Instructor"
        };
        if (req.admin) {
            consdition = {
                createrId: req.admin.id,
                creater: "Admin"
            };
        }
        const yogaStudio = await YogaStudioBusiness.findAll({
            where: consdition,
            include: [{
                model: YogaStudioContact,
                as: 'contacts',
                where: {
                    deletedThrough: null
                },
                required: false
            }, {
                model: YogaStudioImage,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: YogaStudioTime,
                as: 'timings',
                where: {
                    deletedThrough: null
                },
                required: false
            }], order: [
                ['createdAt', 'ASC']
            ]
        })
        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: yogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioForAdmin = async (req, res) => {
    try {
        const { page, limit, search, approvalStatusByAdmin } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        const condition = [];
        if (approvalStatusByAdmin) {
            condition.push({ approvalStatusByAdmin: approvalStatusByAdmin });
        }
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { businessName: { [Op.substring]: search } },
                    { city: { [Op.substring]: search } },
                    { state: { [Op.substring]: search } },
                    { pincode: { [Op.substring]: search } },
                    { street_colony: { [Op.substring]: search } }
                ]
            })
        }
        // Count All studio
        const totalStudio = await YogaStudioBusiness.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All studio
        const studio = await YogaStudioBusiness.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All studio fetched fetched successfully!",
            totalPage: Math.ceil(totalStudio / recordLimit),
            currentPage: currentPage,
            data: studio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Instructor and admin
exports.getYogaStudioById = async (req, res) => {
    try {
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: YogaStudioContact,
                as: 'contacts',
                where: {
                    deletedThrough: null
                },
                required: false
            }, {
                model: YogaStudioImage,
                as: 'images',
                where: {
                    deletedThrough: null
                },
                required: false
            },
            {
                model: YogaStudioTime,
                as: 'timings',
                where: {
                    deletedThrough: null
                },
                required: false
            }]
        })
        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: yogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioForUser = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        const condition = [
            { approvalStatusByAdmin: "Approved" }];
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { businessName: { [Op.substring]: search } },
                    { city: { [Op.substring]: search } },
                    { state: { [Op.substring]: search } },
                    { pincode: { [Op.substring]: search } },
                    { street_colony: { [Op.substring]: search } }
                ]
            })
        }
        // Count All studio
        const totalStudio = await YogaStudioBusiness.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All studio
        const studio = await YogaStudioBusiness.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All studio fetched fetched successfully!",
            totalPage: Math.ceil(totalStudio / recordLimit),
            currentPage: currentPage,
            data: studio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getYogaStudioByIdUser = async (req, res) => {
    try {
        const condition = {
            approvalStatusByAdmin: "Approved",
            [Op.or]: [
                { deletedThrough: null },
                { deletedThrough: "ByUpdation" }
            ]
        };
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                approvalStatusByAdmin: "Approved"
            },
            include: [{
                model: YogaStudioContact,
                as: 'contacts',
                where: condition,
                required: false
            }, {
                model: YogaStudioImage,
                as: 'images',
                where: condition,
                required: false
            },
            {
                model: YogaStudioTime,
                as: 'timings',
                where: condition,
                required: false
            }]
        })
        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: yogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateYogaStudioForInstructor = async (req, res) => {
    try {
        // Validate Body
        const { error } = createBusiness(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { block_building, street_colony, pincode, area, landmark, city, state } = req.body;
        const businessName = capitalizeFirstLetter(req.body.businessName);

        // Find in database
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id,
                creater: "Instructor"
            }
        })
        if (!yogaStudio) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (yogaStudio.approvalStatusByAdmin === "Pending") {
            await yogaStudio.update({
                ...yogaStudio,
                businessName: businessName,
                block_building: block_building,
                street_colony: street_colony,
                pincode: pincode,
                state: state,
                city: city,
                landmark: landmark,
                area: area
            });
            const history = await YSBusinessHistory.findOne({
                where: {
                    contactId: req.params.id,
                    createrId: req.instructor.id,
                    creater: "Instructor",
                    updationStatus: "Pending"
                }
            });
            if (history) {
                await history.update({
                    ...history,
                    businessName: businessName,
                    block_building: block_building,
                    street_colony: street_colony,
                    pincode: pincode,
                    state: state,
                    city: city,
                    landmark: landmark,
                    area: area
                });
            }
        } else {
            // Hard delete any updation request which status is pending
            await YSBusinessHistory.destroy({
                where: {
                    businessId: req.params.id,
                    createrId: req.instructor.id,
                    creater: "Instructor",
                    updationStatus: "Pending"
                }, force: true
            });

            await YSBusinessHistory.create({
                businessName: businessName,
                block_building: block_building,
                street_colony: street_colony,
                pincode: pincode,
                state: state,
                city: city,
                landmark: landmark,
                area: area,
                createrId: createrId,
                creater: creater,
                updationStatus: updationStatus,
                businessId: yogaStudio.id
            });
            // update YogaStudioBusiness anyUpdateRequest
            await yogaStudio.update({ ...yogaStudio, anyUpdateRequest: true });
        }

        // Final Response
        res.status(200).send({
            success: true,
            message: "Updated successfully! Wait for Swasti Approval!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateYogaStudioForAdmin = async (req, res) => {
    try {
        // Validate Body
        const { error } = createBusiness(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { block_building, street_colony, pincode, area, landmark, city, state } = req.body;
        const businessName = capitalizeFirstLetter(req.body.businessName);

        // Find in database
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: condition
        })
        if (!yogaStudio) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (yogaStudio.approvalStatusByAdmin === "Pending") {

        } else {
            // Hard delete any updation request which status is pending
            await YSBusinessHistory.destroy({
                where: {
                    businessId: req.params.id,
                    updationStatus: "Pending"
                }, force: true
            });
            // Create updation request
            await YSBusinessHistory.create({
                businessName: businessName,
                block_building: block_building,
                street_colony: street_colony,
                pincode: pincode,
                state: state,
                city: city,
                landmark: landmark,
                area: area,
                createrId: req.admin.id,
                creater: "Admin",
                updationStatus: "Approved",
                businessId: req.params.id
            });
            // update YogaStudioBusiness also
            await yogaStudio.update({
                businessName: businessName,
                block_building: block_building,
                street_colony: street_colony,
                pincode: pincode,
                state: state,
                city: city,
                landmark: landmark,
                area: area,
                approvalStatusByAdmin: "Approved"
            });
        }
        // update YogaStudioContact anyUpdateRequest
        const anyContact = await YogaStudioContact.findOne({ where: { businessId: contact.businessId, anyUpdateRequest: true } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: contact.businessId, anyUpdateRequest: true } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: contact.businessId, anyUpdateRequest: true } });
        if (anyTime || anyImage || anyContact) {
            await YogaStudioBusiness.update({ anyUpdateRequest: true }, { where: { id: req.params.id } });
        } else {
            await YogaStudioBusiness.update({ anyUpdateRequest: false }, { where: { id: req.params.id } });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: message
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};