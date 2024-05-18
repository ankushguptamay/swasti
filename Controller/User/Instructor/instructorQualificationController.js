const db = require('../../../Models');
const { Op } = require("sequelize");
const { addQualification, changeQualificationStatus } = require("../../../Middleware/Validate/validateInstructor");
const { deleteSingleFile } = require("../../../Util/deleteFile")
const InstructorQualification = db.insturctorQualification;
const Instructor = db.instructor;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.addQualification = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please upload a file!"
            });
        }
        // Validate Body
        const { error } = addQualification(req.body);
        if (error) {
            deleteSingleFile(req.file.path);
            return res.status(400).send(error.details[0].message);
        }
        const { courseType, course, university_institute_name, year, marksType, marks, certificationNumber } = req.body;
        const imagePath = `./Resource/${req.file.filename}`;
        const response = await cloudinary.uploader.upload(imagePath);
        // delete file from resource/servere
        deleteSingleFile(req.file.path);
        // Find in database
        await InstructorQualification.create({
            cloudinaryFileId: response.public_id,
            courseType: courseType,
            course: course,
            university_institute_name: university_institute_name,
            year: year,
            marksType: marksType,
            marks: marks,
            certificationNumber: certificationNumber,
            documentOriginalName: req.file.originalname,
            documentPath: response.secure_url,
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

exports.changeQualificationStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
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
        if (approvalStatusByAdmin === "Approved") {
            await Instructor.update({ isVerify: true }, { where: { id: qualification.instructorId } });
        }
        await qualification.update({
            ...qualification,
            approvalStatusByAdmin: approvalStatusByAdmin
        });
        // Final response
        res.status(200).send({
            success: true,
            message: `Qualification status '${approvalStatusByAdmin}' changed successfully`
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
        await qualification.update({ ...qualification, deletedThrough: "Admin" });
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

exports.restoreQualificationAdmin = async (req, res) => {
    try {
        const qualification = await InstructorQualification.findOne({
            paranoid: false,
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            }
        });
        if (!qualification) {
            return res.status(400).send({
                success: true,
                message: "This qualification is not present!",
            });
        }
        if (qualification.deletedThrough === "Instructor" || qualification.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This qualification is not deleted by Swasti!",
            });
        }
        await qualification.update({ ...qualification, deletedThrough: null });
        // Restore
        await qualification.restore();
        // Final response
        res.status(200).send({
            success: true,
            message: "Qualification restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateQualification = async (req, res) => {
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
        const qualification = await InstructorQualification.findOne({
            where: {
                id: req.params.id,
                instructorId: req.instructor.id
            }
        });
        if (!qualification) {
            deleteSingleFile(req.file.path);
            return res.status(400).send({
                success: true,
                message: "This qualification is not present!",
            });
        }
        const imagePath = `./Resource/${req.file.filename}`;
        const response = await cloudinary.uploader.upload(imagePath);
        // delete file from resource/servere
        deleteSingleFile(req.file.path);
        await InstructorQualification.create({
            cloudinaryFileId: response.public_id,
            courseType: courseType,
            course: course,
            university_institute_name: university_institute_name,
            year: year,
            marksType: marksType,
            marks: marks,
            certificationNumber: certificationNumber,
            documentOriginalName: req.file.originalname,
            documentPath: response.secure_url,
            documentFileName: req.file.filename,
            instructorId: req.instructor.id,
            createdAt: qualification.createdAt,
            approvalStatusByAdmin: "Pending"
        });

        await qualification.update({ ...qualification, deletedThrough: "ByUpdation" });
        // soft delete 
        await qualification.destroy();
        // Final response
        res.status(200).send({
            success: true,
            message: "Qualification updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// Soft Delete
exports.deleteQualificationInstructor = async (req, res) => {
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
        await qualification.update({ ...qualification, deletedThrough: "Instructor" });
        // Soft Delete
        await qualification.destroy();
        // Final response
        res.status(200).send({
            success: true,
            message: "Qualification deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getQualificationById = async (req, res) => {
    try {
        let argument = {
            where: {
                id: req.params.id
            }
        }
        if (req.admin) {
            argument = {
                where: {
                    id: req.params.id
                },
                paranoid: false
            }
        }
        const qualification = await InstructorQualification.findOne(argument);
        if (!qualification) {
            return res.status(400).send({
                success: true,
                message: "This qualification is not present!",
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Qualification fetched successfully!",
            data: qualification
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getSoftDeletedQualification = async (req, res) => {
    try {
        const argument = {
            where: {
                instructorId: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        };
        const qualification = await InstructorQualification.findAll(argument);
        // Final response
        res.status(200).send({
            success: true,
            message: "Soft deleted qualification fetched successfully!",
            data: qualification
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};