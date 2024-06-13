const db = require('../../Models');
const { Op } = require("sequelize");
const { changeQualificationStatus, changePublish } = require("../../Middleware/Validate/validateInstructor");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;
const YogaStudioImage = db.yogaStudioImage;
const YSBusinessHistory = db.ySBusinessHistory;
const YSContactHistory = db.ySContactHistory;
const YSTimeHistory = db.ySTimingHistory;

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
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: req.params.id, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: req.params.id, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: req.params.id, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: req.params.id, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await business.update({
                ...business,
                approvalStatusByAdmin: approvalStatusByAdmin,
                anyUpdateRequest: true
            });
        } else {
            // Update business
            await business.update({
                ...business,
                approvalStatusByAdmin: approvalStatusByAdmin,
                anyUpdateRequest: false
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

exports.changeYogaStudioImageStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find image In Database
        const image = await YogaStudioImage.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            }
        });
        if (!image) {
            return res.status(400).send({
                success: false,
                message: "This studio image is not present!"
            });
        }
        // Find is perent business approved In Database
        const business = await YogaStudioBusiness.findOne({
            where: {
                id: image.businessId
            }
        });;
        if (approvalStatusByAdmin === "Approved") {
            if (business.approvalStatusByAdmin !== "Approved") {
                return res.status(400).send({
                    success: false,
                    message: "Parent business details is not approved!"
                });
            }
        }
        // Update business
        await image.update({
            ...image,
            anyUpdateRequest: false,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: image.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: image.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: image.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: image.businessId, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: true
            });
        } else {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: false
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio image ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeYogaStudioContactStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find contact In Database
        const contact = await YogaStudioContact.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            }
        });
        if (!contact) {
            return res.status(400).send({
                success: false,
                message: "This studio is not present!"
            });
        }
        // Find is perent business approved In Database
        const business = await YogaStudioBusiness.findOne({
            where: {
                id: contact.businessId
            }
        });;
        if (approvalStatusByAdmin === "Approved") {
            if (business.approvalStatusByAdmin !== "Approved") {
                return res.status(400).send({
                    success: false,
                    message: "Perent business details is not approved!"
                });
            }
        }
        // Update business
        await contact.update({
            ...contact,
            anyUpdateRequest: false,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: contact.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: contact.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: contact.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: contact.businessId, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: true
            });
        } else {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: false
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio contact ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};


exports.changeYogaStudioTimeStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find time In Database
        const time = await YogaStudioTime.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            }
        });
        if (!time) {
            return res.status(400).send({
                success: false,
                message: "This studio time is not present!"
            });
        }
        // Find is perent business approved In Database
        const business = await YogaStudioBusiness.findOne({
            where: {
                id: time.businessId
            }
        });;
        if (approvalStatusByAdmin === "Approved") {
            if (business.approvalStatusByAdmin !== "Approved") {
                return res.status(400).send({
                    success: false,
                    message: "Perent business details is not approved!"
                });
            }
        }
        // Update business
        await time.update({
            ...time,
            anyUpdateRequest: false,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: time.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: time.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: time.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: time.businessId, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: true
            });
        } else {
            // Update business
            await business.update({
                ...business,
                anyUpdateRequest: false
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio time ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitYogaStudioForApproval = async (req, res) => {
    try {
        const instructorId = req.instructor.id;

        // Find Yoga studio In Database
        const yoga = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId,
                approvalStatusByAdmin: null
            }
        });
        if (!yoga) {
            return res.status(400).send({
                success: false,
                message: "This Yoga studio is not present!"
            });
        }
        await YogaStudioContact.update({ approvalStatusByAdmin: "Pending" }, { where: { businessId: req.params.id } });
        await YogaStudioImage.update({ approvalStatusByAdmin: "Pending" }, { where: { businessId: req.params.id } });
        await YogaStudioTime.update({ approvalStatusByAdmin: "Pending" }, { where: { businessId: req.params.id } });
        // Update Yoga studio
        await yoga.update({
            ...yoga,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitYSContactForApproval = async (req, res) => {
    try {
        const instructorId = req.instructor.id;

        // Find Yoga studio In Database
        const yoga = await YogaStudioContact.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId,
                approvalStatusByAdmin: null
            }
        });
        if (!yoga) {
            return res.status(400).send({
                success: false,
                message: "This Yoga studio contact is not present!"
            });
        }
        // Update Yoga studio
        await yoga.update({
            ...yoga,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio contact successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitYSTimeForApproval = async (req, res) => {
    try {
        const instructorId = req.instructor.id;

        // Find Yoga studio In Database
        const yoga = await YogaStudioTime.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId,
                approvalStatusByAdmin: null
            }
        });
        if (!yoga) {
            return res.status(400).send({
                success: false,
                message: "This Yoga studio time is not present!"
            });
        }
        // Update Yoga studio
        await yoga.update({
            ...yoga,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio time successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.submitYSImageForApproval = async (req, res) => {
    try {
        const instructorId = req.instructor.id;

        // Find Yoga studio In Database
        const yoga = await YogaStudioImage.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId,
                approvalStatusByAdmin: null
            }
        });
        if (!yoga) {
            return res.status(400).send({
                success: false,
                message: "This Yoga studio image is not present!"
            });
        }
        // Update Yoga studio
        await yoga.update({
            ...yoga,
            approvalStatusByAdmin: "Pending"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Yoga studio image successfully submit for approval!`
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.publishYogaStudio = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePublish(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPublish } = req.body;
        const instructorId = req.instructor.id;
        // Change message
        let message = "unpublish";
        if (isPublish === true) {
            message = "publish";
        }
        // Find Yoga studio In Database
        const yoga = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                instructorId: instructorId
            }
        });
        if (!yoga) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (yoga.approvalStatusByAdmin !== "Approved") {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not approved!"
            });
        }
        // Update yoga
        await yoga.update({
            ...yoga,
            isPublish: isPublish
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `yoga studio ${message} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeYSBusinessUpdationStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find yoga In Database
        const history = await YSBusinessHistory.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!history) {
            return res.status(400).send({
                success: false,
                message: "This updation request is not present is not present!"
            });
        }
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: history.businessId
            }
        });
        if (approvalStatusByAdmin === "Approved") {
            await yogaStudio.update({
                ...yogaStudio,
                latitude: history.latitude,
                longitude: history.longitude,
                businessName: history.businessName,
                block_building: history.block_building,
                street_colony: history.street_colony,
                pincode: history.pincode,
                state: history.state,
                city: history.city,
                landmark: history.landmark,
                area: history.area
            });
        }
        // Update history
        await history.update({
            ...history,
            updationStatus: approvalStatusByAdmin
        });
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: history.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: history.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: history.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: history.businessId, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await yogaStudio.update({
                ...yogaStudio,
                anyUpdateRequest: true
            });
        } else {
            // Update business
            await yogaStudio.update({
                ...yogaStudio,
                anyUpdateRequest: false
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Request ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeYSTimingUpdationStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find yoga In Database
        const history = await YSTimeHistory.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!history) {
            return res.status(400).send({
                success: false,
                message: "This updation request is not present is not present!"
            });
        }
        const yogaStudioTime = await YogaStudioTime.findOne({
            where: {
                id: history.ySTimeId
            }
        });
        if (approvalStatusByAdmin === "Approved") {
            await yogaStudioTime.update({
                ...yogaStudioTime,
                openAt: history.openAt,
                closeAt: history.closeAt,
                isFri: history.isFri,
                isMon: history.isMon,
                isSat: history.isSat,
                isSun: history.isSun,
                isThu: history.isThu,
                isTue: history.isThu,
                isTue: history.isTue,
                isWed: history.isWed,
                anyUpdateRequest: false
            });
        }
        // Update history
        await history.update({
            ...history,
            updationStatus: approvalStatusByAdmin
        });
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: yogaStudioTime.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: yogaStudioTime.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: yogaStudioTime.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: yogaStudioTime.businessId, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await YogaStudioBusiness.update({
                anyUpdateRequest: true
            }, { where: { id: yogaStudioTime.businessId } });
        } else {
            // Update business
            await YogaStudioBusiness.update({
                anyUpdateRequest: false
            }, { where: { id: yogaStudioTime.businessId } });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Request ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeYSContactUpdationStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find Yoga In Database
        const history = await YSContactHistory.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!history) {
            return res.status(400).send({
                success: false,
                message: "This updation request is not present is not present!"
            });
        }
        const yogaStudioContact = await YogaStudioContact.findOne({
            where: {
                id: history.ySContactId
            }
        });
        if (approvalStatusByAdmin === "Approved") {
            await yogaStudioContact.update({
                ...yogaStudioContact,
                title: history.title,
                person: history.person,
                mobileNumber: history.mobileNumber,
                whatsAppNumber: history.whatsAppNumber,
                landLineNumber: history.landLineNumber,
                email: history.email,
                anyUpdateRequest: false
            });
        }
        // Update history
        await history.update({
            ...history,
            updationStatus: approvalStatusByAdmin
        });
        // Any updation
        const anyContatct = await YogaStudioContact.findOne({ where: { businessId: yogaStudioContact.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { businessId: yogaStudioContact.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { businessId: yogaStudioContact.businessId, anyUpdateRequest: true, deletedThrough: null } });
        const anyBusinessHistory = await YSBusinessHistory.findOne({ where: { businessId: yogaStudioContact.businessId, updationStatus: "Pending" } })
        if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
            // Update business
            await YogaStudioBusiness.update({
                anyUpdateRequest: true
            }, { where: { id: yogaStudioContact.businessId } });
        } else {
            // Update business
            await YogaStudioBusiness.update({
                anyUpdateRequest: false
            }, { where: { id: yogaStudioContact.businessId } });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `Request ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};