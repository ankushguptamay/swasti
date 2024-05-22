const db = require('../../Models');
const { Op } = require("sequelize");
const { createTiming } = require('../../Middleware/Validate/validateYogaStudio');
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioTime = db.yogaStudioTiming

// createYogaStudioTiming
// updateYogaStudioTimeForInstructor
// updateYogaStudioTimeForAdmin

exports.createYogaStudioTiming = async (req, res) => {
    try {
        // Validate Body
        const { error } = createTiming(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { openAt, closeAt, isSun, isMon, isTue, isWed, isThu, isFri, isSat } = req.body;

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
        await YogaStudioTime.create({
            openAt: openAt,
            closeAt: closeAt,
            isFri: isFri,
            isMon: isMon,
            isSat: isSat,
            isSun: isSun,
            isThu: isThu,
            isTue: isTue,
            isWed: isWed,
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

exports.updateYogaStudioTimeForInstructor = async (req, res) => {
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
                createrId: req.instructor.id,
                creater: "Instructor"
            }
        })
        if (!time) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (time.approvalStatusByAdmin === "Pending") {
            // Hard delete
            await time.destroy({ force: true });
            // Create new one
            await YogaStudioTime.create({
                openAt: openAt,
                closeAt: closeAt,
                isFri: isFri,
                isMon: isMon,
                isSat: isSat,
                isSun: isSun,
                isThu: isThu,
                isTue: isTue,
                isWed: isWed,
                createrId: req.instructor.id,
                creater: "Instructor",
                businessId: time.businessId,
                approvalStatusByAdmin: "Pending"
            });
        } else {
            // Update deleted through
            await time.update({ ...time, deletedThrough: "ByUpdation" })
            // Create Updation History
            await YogaStudioTime.create({
                openAt: openAt,
                closeAt: closeAt,
                isFri: isFri,
                isMon: isMon,
                isSat: isSat,
                isSun: isSun,
                isThu: isThu,
                isTue: isTue,
                isWed: isWed,
                createrId: req.instructor.id,
                creater: "Instructor",
                businessId: time.businessId,
                approvalStatusByAdmin: "Pending"
            });
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

exports.updateYogaStudioTimeForAdmin = async (req, res) => {
    try {
        // Validate Body
        const { error } = createTime(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Body
        const { openAt, closeAt, isSun, isMon, isTue, isWed, isThu, isFri, isSat } = req.body;

        // Find in database
        const time = await YogaStudioTime.findOne({
            where: {
                id: req.params.id
            }
        })
        if (!time) {
            return res.status(400).send({
                success: false,
                message: "This yoga studio is not present!"
            });
        }
        if (time.approvalStatusByAdmin === "Pending") {
            // Hard delete
            await time.destroy({ force: true });
            // Create new one
            await YogaStudioTime.create({
                openAt: openAt,
                closeAt: closeAt,
                isFri: isFri,
                isMon: isMon,
                isSat: isSat,
                isSun: isSun,
                isThu: isThu,
                isTue: isTue,
                isWed: isWed,
                createrId: req.admin.id,
                creater: "Admin",
                businessId: time.businessId,
                approvalStatusByAdmin: "Approved"
            });
        } else {
            // Update deleted through
            await time.update({ ...time, deletedThrough: "ByUpdation" })
            // Create Updation History
            await YogaStudioTime.create({
                openAt: openAt,
                closeAt: closeAt,
                isFri: isFri,
                isMon: isMon,
                isSat: isSat,
                isSun: isSun,
                isThu: isThu,
                isTue: isTue,
                isWed: isWed,
                createrId: req.admin.id,
                creater: "Admin",
                businessId: time.businessId,
                approvalStatusByAdmin: "Admin"
            });
        }
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