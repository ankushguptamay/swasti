const db = require('../../../Models');
const { Op } = require("sequelize");
const { addQualification} = require("../../../Middleware/Validate/validateInstructor");
const { deleteSingleFile } = require("../../../Util/deleteFile")
const InstructorQualification = db.insturctorQualification;
const Instructor = db.instructor;

exports.addQualification = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..upload a file!"
            });
        }
        // Validate Body
        const { error } = addQualification(req.body);
        if (error) {
            deleteSingleFile(req.file.path);
            return res.status(400).send(error.details[0].message);
        }
        const { courseType, course, university_institute_name, year, marksType, marks, certificationNumber } = req.body;
        // Find in database
        await InstructorQualification.create({
            courseType: courseType,
            course: course,
            university_institute_name: university_institute_name,
            year: year,
            marksType: marksType,
            marks: marks,
            certificationNumber: certificationNumber,
            documentOriginalName: req.file.originalname,
            documentPath: req.file.path,
            documentFileName: req.file.filename,
            instructorId: req.instructor.id,
            approvalStatusByAdmin: "Pending"
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Qualification added successfully!"
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
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        // Find in database
        const deleteProfile = await InstructorProfile.findAll({
            limit: limit,
            offset: offSet,
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

exports.softDeleteQualificationAdmin = async (req, res) => {
    try {
        const qualification = await InstructorQualification.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!qualification) {
            return res.status(400).send({
                success: true,
                message: "This qualification is not present!",
            });
        }
        await qualification.destroy();
        // Final response
        res.status(200).send({
            success: true,
            message: "Qualification soft deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};