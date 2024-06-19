const db = require('../../Models');
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile")
const AdminBanner = db.adminBanner;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.addAdminBanner = async (req, res) => {
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
        await AdminBanner.create({
            cloudinaryFileId: response.public_id,
            originalName: req.file.originalname,
            path: response.secure_url,
            fileName: req.file.filename
        });

        // Final response
        res.status(200).send({
            success: true,
            message: "Banner Image added successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAdminBanner = async (req, res) => {
    try {
        const banner = await AdminBanner.findAll();

        // Final response
        res.status(200).send({
            success: true,
            message: "Banner Image fetched successfully!",
            data: banner
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.deleteAdminBanner = async (req, res) => {
    try {
        const banner = await AdminBanner.findOne({ where: { id: req.params.id } });
        if (!banner) {
            return res.status(400).send({
                success: false,
                message: "This banner image is not present!"
            });
        }
        await cloudinary.uploader.destroy(banner.cloudinaryFileId);
        await banner.destroy();
        // Final response
        res.status(200).send({
            success: true,
            message: "Banner Image deleted successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};