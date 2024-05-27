const db = require('../../Models');
const { Op } = require("sequelize");
const { createBusiness } = require('../../Middleware/Validate/validateYogaStudio');
const { changeQualificationStatus } = require("../../Middleware/Validate/validateInstructor");
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;
const YogaStudioImage = db.yogaStudioImage;
const YSBusinessHistory = db.ySBusinessHistory;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// createYogaStudioBusiness
// getMyYogaStudio for instructor/admin
// getYogaStudioForAdmin
// getYogaStudioById for instructor/admin
// getYogaStudioForUser
// getYogaStudioByIdUser
// updateYogaStudio
// changeYogaStudioBusinessStatus

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

exports.getYogaStudioByIdAdmin = async (req, res) => {
    try {
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: YogaStudioContact,
                as: 'contacts'
            }, {
                model: YogaStudioImage,
                as: 'images'
            },
            {
                model: YogaStudioTime,
                as: 'timings'
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

exports.getYogaStudioByIdInstructor = async (req, res) => {
    try {
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id
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
        const condition1 = {
            approvalStatusByAdmin: "Approved",
            deletedThrough: null
        };
        const condition2 = {
            approvalStatusByAdmin: "Approved",
            deletedThrough: "ByUpdation"

        };
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                approvalStatusByAdmin: "Approved",
                deletedThrough: null
            }
        });
        if (!yogaStudio) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        // Add condition
        let contacts = await YogaStudioContact.findOne({ where: condition1 });
        if (!contacts) {
            contacts = await YogaStudioContact.findOne({ where: condition2 });
        }
        console.log(typeof contacts.mobileNumber)
        const image = await YogaStudioImage.findOne({ where: condition1 });
        const time = await YogaStudioTime.findOne({ where: condition1 });

        const newYogaStudio = {
            ...yogaStudio.dataValues,
            contacts: contacts,
            images: image,
            times: time
        };
        // Final Response
        res.status(200).send({
            success: true,
            message: "Fetched successfully!",
            data: newYogaStudio
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateYogaStudioBusinessForInstructor = async (req, res) => {
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
                    businessId: req.params.id,
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

exports.updateYogaStudioBusinessForAdmin = async (req, res) => {
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
            const history = await YSBusinessHistory.findOne({
                where: {
                    businessId: req.params.id,
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
                    area: area,
                    updationStatus: "Approved"
                });
            }
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
        }
        // update YogaStudioBusiness also
        await yogaStudio.update({
            ...yogaStudio,
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

exports.changeYogaStudioBusinessStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find business In Database
        const business = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!business) {
            return res.status(400).send({
                success: false,
                message: "This studio is not present!"
            });
        }
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { anyUpdateRequest: true, deletedThrough: null } });
        if (anyContatct || anyImage || anyTime) {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: true,
                approvalStatusByAdmin: approvalStatusByAdmin
            });
        } else {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: false,
                approvalStatusByAdmin: approvalStatusByAdmin
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio business ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteYogaStudioBusiness = async (req, res) => {
    try {
        let deletedThrough = "Admin";
        let condition = {
            id: req.params.id
        };
        if (req.instructor) {
            condition = {
                id: req.params.id,
                creater: "Instructor",
                createrId: req.instructor.id,
            };
            deletedThrough = "Instructor";
        }
        // Find business In Database
        const business = await YogaStudioBusiness.findOne({
            where: condition
        });
        if (!business) {
            return res.status(400).send({
                success: false,
                message: "This studio is not present!"
            });
        }
        // update business
        await business.update({
            ...business,
            deletedThrough: deletedThrough
        });
        // soft delete business
        await business.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio business deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

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
                message: `Can not restore this business successfully!`
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

exports.hardDeleteYogaStudioBusiness = async (req, res) => {
    try {
        let condition = {
            id: req.params.id
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
        // hard delete Contact
        await YogaStudioContact.destroy({ where: { businessId: req.params.id }, force: true });
        // hard delete Times
        await YogaStudioTime.destroy({ where: { businessId: req.params.id }, force: true });
        // hard delete business history
        await YSBusinessHistory.destroy({ where: { businessId: req.params.id }, force: true });
        // hard delete business images
        const images = await YogaStudioImage.findAll({ where: { businessId: req.params.id }, force: true });
        for (let i = 0; i < images.length; i++) {
            if (images[i].cloudinaryFileId) {
                await cloudinary.uploader.destroy(images[i].cloudinaryFileId);
            }
        }
        await YogaStudioImage.destroy({ where: { businessId: req.params.id }, force: true });
        // hard delete business
        await business.destroy({ force: true });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio business hard deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};