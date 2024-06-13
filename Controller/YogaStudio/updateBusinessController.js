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
const YSContactHistory = db.ySContactHistory;
const YSTimeHistory = db.ySTimingHistory;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.updateYogaStudioBusiness = async (req, res) => {
    try {
        // Validate Body
        const { error } = createBusiness(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { block_building, street_colony, pincode, area, landmark, city, state, latitude, longitude } = req.body;
        const businessName = capitalizeFirstLetter(req.body.businessName);

        // Find in database
        const yogaStudio = await YogaStudioBusiness.findOne({
            where: {
                id: req.params.id,
                instructorId: req.instructor.id
            }
        })
        if (!yogaStudio) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (yogaStudio.approvalStatusByAdmin === "Pending" || yogaStudio.approvalStatusByAdmin === null) {
            await yogaStudio.update({
                ...yogaStudio,
                longitude: longitude,
                latitude: latitude,
                businessName: businessName,
                block_building: block_building,
                street_colony: street_colony,
                pincode: pincode,
                state: state,
                city: city,
                landmark: landmark,
                area: area
            });
        } else {
            // Hard delete any updation request which status is pending
            await YSBusinessHistory.destroy({
                where: {
                    businessId: req.params.id,
                    updationStatus: "Pending"
                }
            });

            await YSBusinessHistory.create({
                longitude: longitude,
                latitude: latitude,
                businessName: businessName,
                block_building: block_building,
                street_colony: street_colony,
                pincode: pincode,
                state: state,
                city: city,
                landmark: landmark,
                area: area,
                updationStatus: "Pending",
                businessId: yogaStudio.id
            });
        }
        // update YogaStudioBusiness anyUpdateRequest
        await yogaStudio.update({ ...yogaStudio, anyUpdateRequest: true });
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

exports.updateYogaStudioContact = async (req, res) => {
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
                instructorId: req.instructor.id
            }
        })
        if (!contact) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (contact.approvalStatusByAdmin === "Pending" || contact.approvalStatusByAdmin === null) {
            await contact.update({
                ...contact,
                title: title,
                person: person,
                mobileNumber: mobileNumber,
                whatsAppNumber: whatsAppNumber,
                landLineNumber: landLineNumber,
                email: email
            });
        } else {
            // Hard delete any updation request which status is pending
            await YSContactHistory.destroy({
                where: {
                    ySContactId: req.params.id,
                    updationStatus: "Pending"
                }
            });

            await YSContactHistory.create({
                title: title,
                person: person,
                mobileNumber: mobileNumber,
                whatsAppNumber: whatsAppNumber,
                landLineNumber: landLineNumber,
                email: email,
                updationStatus: "Pending",
                ySContactId: contact.id,
                updatedBy: "Instructor"
            });
            // update YogaStudioBusiness anyUpdateRequest
            await contact.update({ ...contact, anyUpdateRequest: true });
        }
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


exports.updateYogaStudioTime = async (req, res) => {
    try {
        // Validate Body
        const { error } = createTiming(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { openAt, closeAt, isSun, isMon, isTue, isWed, isThu, isFri, isSat } = req.body;

        // Find in database
        const time = await YogaStudioTime.findOne({
            where: {
                id: req.params.id,
                instructorId: req.instructor.id
            }
        })
        if (!time) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (time.approvalStatusByAdmin === "Pending" || time.approvalStatusByAdmin === null) {
            await time.update({
                ...time,
                openAt: openAt,
                closeAt: closeAt,
                isFri: isFri,
                isMon: isMon,
                isSat: isSat,
                isSun: isSun,
                isThu: isThu,
                isTue: isThu,
                isTue: isTue,
                isWed: isWed
            });
        } else {
            // Hard delete any updation request which status is pending
            await YSContactHistory.destroy({
                where: {
                    ySTimeId: req.params.id,
                    updationStatus: "Pending"
                }
            });

            await YSContactHistory.create({
                openAt: openAt,
                closeAt: closeAt,
                isFri: isFri,
                isMon: isMon,
                isSat: isSat,
                isSun: isSun,
                isThu: isThu,
                isTue: isThu,
                isTue: isTue,
                isWed: isWed,
                updationStatus: "Pending",
                ySTimeId: time.id,
                updatedBy: "Instructor"
            });
            // update YogaStudioBusiness anyUpdateRequest
            await time.update({ ...time, anyUpdateRequest: true });
        }
        // update YogaStudioBusiness anyUpdateRequest
        await YogaStudioBusiness.update({ anyUpdateRequest: true }, { where: { id: time.businessId } });
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
