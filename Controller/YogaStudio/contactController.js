const db = require('../../Models');
const { Op } = require("sequelize");
const { createContact } = require('../../Middleware/Validate/validateYogaStudio');
const { changeQualificationStatus } = require("../../Middleware/Validate/validateInstructor");
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioImage = db.yogaStudioImage;
const YogaStudioTime = db.yogaStudioTiming
const YSContactHistory = db.ySContactHistory;

// createYogaStudioContact
// updateYogaStudioContactForInstructor
// updateYogaStudioContactForAdmin
// changeYogaStudioContactStatus

exports.createYogaStudioContact = async (req, res) => {
    try {
        // Validate Body
        const { error } = createContact(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { mobileNumber, whatsAppNumber, email, landLineNumber } = req.body;
        const title = capitalizeFirstLetter(req.body.title);
        const person = capitalizeFirstLetter(req.body.person);
        let createrId, creater, approvalStatusByAdmin;
        if (req.instructor) {
            createrId = req.instructor.id;
            creater = "Instructor";
            approvalStatusByAdmin = "Pending";
        } else if (req.admin) {
            createrId = req.admin.id
            creater = "Admin";
            approvalStatusByAdmin = "Approved";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not created Yoga studio!"
            });
        }
        await YogaStudioContact.create({
            title: title,
            person: person,
            mobileNumber: mobileNumber,
            whatsAppNumber: whatsAppNumber,
            landLineNumber: landLineNumber,
            email: email,
            createrId: createrId,
            creater: creater,
            businessId: req.params.id,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // update YogaStudioBusiness anyUpdateRequest
        if (req.instructor) {
            await YogaStudioBusiness.update({ anyUpdateRequest: true }, { where: { id: req.params.id } });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Submit successfully!",
            data: {
                id: req.params.id,
            }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateYogaStudioContactForInstructor = async (req, res) => {
    try {
        // Validate Body
        const { error } = createContact(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { mobileNumber, whatsAppNumber, email, landLineNumber } = req.body;
        const title = capitalizeFirstLetter(req.body.title);
        const person = capitalizeFirstLetter(req.body.person);


        // Find in database
        const contact = await YogaStudioContact.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id,
                creater: "Instructor"
            }
        })
        if (!contact) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (contact.approvalStatusByAdmin === "Pending") {
            // Hard delete
            await contact.destroy({ force: true });
        } else {
            // Update deleted through
            await contact.update({ ...contact, deletedThrough: "ByUpdation" });
        }
        // Create Updation History
        await YogaStudioContact.create({
            title: title,
            person: person,
            mobileNumber: mobileNumber,
            whatsAppNumber: whatsAppNumber,
            landLineNumber: landLineNumber,
            email: email,
            createrId: req.instructor.id,
            creater: "Instructor",
            businessId: contact.businessId,
            approvalStatusByAdmin: "Pending"
        });
        // update YogaStudioBusiness anyUpdateRequest
        await YogaStudioBusiness.update({ anyUpdateRequest: true }, { where: { id: contact.businessId } });
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

exports.updateYogaStudioContactForAdmin = async (req, res) => {
    try {
        // Validate Body
        const { error } = createContact(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { mobileNumber, whatsAppNumber, email, landLineNumber } = req.body;
        const title = capitalizeFirstLetter(req.body.title);
        const person = capitalizeFirstLetter(req.body.person);

        // Find in database
        const contact = await YogaStudioContact.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!contact) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (contact.approvalStatusByAdmin === "Pending") {
            // Hard delete
            await contact.destroy({ force: true });
        } else {
            // Update deleted through
            await contact.update({ ...contact, deletedThrough: "ByUpdation" })
        }
        // Create new one
        await YogaStudioContact.create({
            title: title,
            person: person,
            mobileNumber: mobileNumber,
            whatsAppNumber: whatsAppNumber,
            landLineNumber: landLineNumber,
            email: email,
            createrId: req.admin.id,
            creater: "Admin",
            businessId: contact.businessId,
            anyUpdateRequest: false,
            approvalStatusByAdmin: "Approved"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Updated successfully!"
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
        const anyContatct = await YogaStudioContact.findOne({ where: { anyUpdateRequest: true, deletedThrough: null } });
        const anyImage = await YogaStudioImage.findOne({ where: { anyUpdateRequest: true, deletedThrough: null } });
        const anyTime = await YogaStudioTime.findOne({ where: { anyUpdateRequest: true, deletedThrough: null } });
        if (anyContatct || anyImage || anyTime) {
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