const db = require('../../../Models');
const { Op } = require("sequelize");
const { } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const StudentProfile = db.studentProfile;

exports.addStudentProfile = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..upload profile photo!"
            });
        }
        // Find in database
        await StudentProfile.create({
            originalName: req.file.originalname,
            path: req.file.path,
            fileName: req.file.filename,
            studentId: req.student.id,
            approvalStatusByAdmin: "Pending"
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Student Image added successfully! Wait For Admin Approval!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllDeletedStudentProfileById = async (req, res) => {
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
        const totalProfile = await StudentProfile.count({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        // Find in database
        const deleteProfile = await StudentProfile.findAll({
            where: {
                id: req.params.id,
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

exports.getAllStudentProfiles = async (req, res) => {
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
        const totalProfile = await StudentProfile.count({
            where: {
                [Op.and]: condition
            }
        });
        // Find in database
        const profile = await StudentProfile.findAll({
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

exports.approveStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
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
        const previousProfile = await StudentProfile.findAll({
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

exports.rejectStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
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

exports.deleteStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
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