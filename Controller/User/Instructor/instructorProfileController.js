const db = require('../../../Models');
const { Op } = require("sequelize");
const { } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const InstructorProfile = db.instructorProfile;

exports.addInstructorProfile = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..upload profile photo!"
            });
        }
        // Find in database
        await InstructorProfile.create({
            originalName: req.file.originalname,
            path: req.file.path,
            fileName: req.file.filename,
            instructorId: req.instructor.id,
            approvalStatusByAdmin: "Pending"
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Teacher Image added successfully! Wait For Admin Approval!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllDeletedInstructorProfileById = async (req, res) => {
    try {
        const { page, limit } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        const totalProfile = await InstructorProfile.count({
            where: {
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        // Find in database
        const deleteProfile = await InstructorProfile.findAll({
            where: {
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Delted Profile fetched successfully!",
            totalPage: Math.ceil(totalProfile / recordLimit),
            currentPage: currentPage,
            data: deleteProfile
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllInstructorProfiles = async (req, res) => {
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
        // Search 
        const condition = [];
        if (search) {
            condition.push({
                approvalStatusByAdmin: search
            })
        }
        const totalProfile = await InstructorProfile.count({
            where: {
                [Op.and]: condition
            }
        });
        // Find in database
        const profile = await InstructorProfile.findAll({
            where: {
                [Op.and]: condition
            }
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Profile for approval fetched successfully!",
            totalPage: Math.ceil(totalProfile / recordLimit),
            currentPage: currentPage,
            data: profile
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.approveInstructorProfile = async (req, res) => {
    try {
        const profile = await InstructorProfile.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!profile) {
            return res.status(400).send({
                success: true,
                message: "Profile photo is not present!",
            });
        }
        const previousProfile = await InstructorProfile.findAll({
            where: {
                id: req.params.id,
                createdAt: { [Op.lt]: profile.createdAt }
            }
        });
        if (previousProfile.length > 0) {
            for (let i = 0; i < previousProfile.length; i++) {
                await previousProfile[i].destroy();
            }
        }
        await profile.update({
            ...profile,
            approvalStatusByAdmin: "Approved"
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Profile photo approved successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.rejectInstructorProfile = async (req, res) => {
    try {
        const profile = await InstructorProfile.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!profile) {
            return res.status(400).send({
                success: true,
                message: "Profile photo is not present!",
            });
        }
        await profile.update({
            ...profile,
            approvalStatusByAdmin: "Rejected"
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Profile photo rejected successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const profile = await InstructorProfile.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!profile) {
            return res.status(400).send({
                success: true,
                message: "Profile photo is not present!",
            });
        }
        await profile.destroy();
        // Final response
        res.status(200).send({
            success: true,
            message: "Profile photo deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};