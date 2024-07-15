const db = require('../../../Models');
const { Op } = require("sequelize");
const { } = require("../../../Middleware/Validate/validateStudent");
const { deleteSingleFile } = require("../../../Util/deleteFile")
const StudentProfile = db.studentProfile;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.addUpdateStudentProfile = async (req, res) => {
    try {
        // File should be exist
        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Please..upload profile photo!"
            });
        }
        const imagePath = `./Resource/${req.file.filename}`;
        const response = await cloudinary.uploader.upload(imagePath);
        // delete file from resource/servere
        deleteSingleFile(req.file.path);
        const profile = await StudentProfile.findOne({
            where: {
                studentId: req.student.id
            }
        });
        if (!profile) {
            await StudentProfile.create({
                cloudinaryFileId: response.public_id,
                originalName: req.file.originalname,
                path: response.secure_url,
                fileName: req.file.filename,
                studentId: req.student.id
            });
        } else {
            // update deletedThrough
            await profile.update({
                ...profile,
                deletedThrough: "ByUpdation"
            });
            // soft delete previos profile
            await profile.destroy();
            // create new profile pic
            await StudentProfile.create({
                cloudinaryFileId: response.public_id,
                originalName: req.file.originalname,
                path: response.secure_url,
                fileName: req.file.filename,
                studentId: req.student.id
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Student Image added successfully!"
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
        let condition = {
            id: req.params.id,
            studentId: req.student.id
        };
        let deletedThrough = "Student";
        let message = "deleted";
        if (req.admin) {
            condition = {
                id: req.params.id
            };
            deletedThrough = "Admin";
            message = "soft deleted";
        }
        const profile = await StudentProfile.findOne({
            where: condition
        });
        if (!profile) {
            return res.status(400).send({
                success: true,
                message: "Profile photo is not present!",
            });
        }
        // update deletedThrough
        await profile.update({
            ...profile,
            deletedThrough: deletedThrough
        });
        // soft delete previos profile
        await profile.destroy();
        // Final response
        res.status(200).send({
            success: true,
            message: `Profile photo ${message} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};