const db = require('../../Models');
const { Op } = require("sequelize");
const { homeTutorValidation } = require('../../Middleware/Validate/validateHomeTutor');
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;

exports.updateHomeTutor = async (req, res) => {
    try {
        // Validate Body
        const { error } = homeTutorValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { serviceOffered, language, privateSessionPrice_Day, privateSessionPrice_Month, groupSessionPrice_Day, groupSessionPrice_Month, specilization, instructorBio } = req.body;
        // Validate price with there offer
        if (serviceOffered.length === 1) {
            if (serviceOffered[0] === "Group Class") {
                if (groupSessionPrice_Day && groupSessionPrice_Month) {
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Please enter required group class price!"
                    });
                }
            } else if (serviceOffered[0] === "Individual Class") {
                if (privateSessionPrice_Day && privateSessionPrice_Month) {
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Please enter required individual class price!"
                    });
                }
            } else {
                return res.status(400).send({
                    success: false,
                    message: "This service offered is not valid!"
                });
            }
        } else if (serviceOffered.length === 2) {
            if (groupSessionPrice_Day && groupSessionPrice_Month && privateSessionPrice_Day && privateSessionPrice_Month) {
            } else {
                return res.status(400).send({
                    success: false,
                    message: "Please enter required price!"
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                message: "Please select required service offered!"
            });
        }
        // Find in database
        const homeTutor = await HomeTutor.findOne({
            where: {
                id: req.params.id,
                instructorId: req.instructor.id
            }
        });
        if (!homeTutor) {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present!"
            });
        }
        if (homeTutor.approvalStatusByAdmin === null || homeTutor.approvalStatusByAdmin === "Pending") {
            await homeTutor.update({
                ...homeTutor,
                serviceOffered: serviceOffered,
                language: language,
                privateSessionPrice_Day: privateSessionPrice_Day,
                privateSessionPrice_Month: privateSessionPrice_Month,
                groupSessionPrice_Day: groupSessionPrice_Day,
                groupSessionPrice_Month: groupSessionPrice_Month,
                specilization: specilization,
                instructorBio: instructorBio,
            });
        } else {
            // Delete any updation request if present
            await HomeTutorHistory.destroy({
                where: {
                    homeTutorId: homeTutor.id,
                    updationStatus: "Pending"
                }
            });
            // create update history
            await HomeTutorHistory.create({
                serviceOffered: serviceOffered,
                language: language,
                privateSessionPrice_Day: privateSessionPrice_Day,
                privateSessionPrice_Month: privateSessionPrice_Month,
                groupSessionPrice_Day: groupSessionPrice_Day,
                groupSessionPrice_Month: groupSessionPrice_Month,
                specilization: specilization,
                instructorBio: instructorBio,
                homeTutorId: homeTutor.id,
                updationStatus: "Pending",
                updatedBy: "Instructor"
            });
            await homeTutor.update({
                ...homeTutor,
                anyUpdateRequest: true
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home Tutor updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};