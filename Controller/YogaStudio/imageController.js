const db = require('../../Models');
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile");
const { changeQualificationStatus } = require("../../Middleware/Validate/validateInstructor");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioImage = db.yogaStudioImage;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// createYogaStudioImage
// changeYogaStudioImageStatus

exports.createYogaStudioImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.files) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload image!"
            });
        }

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
        const files = req.files;
        for (let i = 0; i < files.length; i++) {
            const imagePath = `./Resource/${files[i].filename}`;
            const response = await cloudinary.uploader.upload(imagePath);
            // delete file from resource/servere
            deleteSingleFile(files[i].path);
            await YogaStudioImage.create({
                cloudinaryFileId: response.public_id,
                originalName: files[i].originalname,
                path: response.secure_url,
                fileName: files[i].filename,
                createrId: createrId,
                creater: creater,
                businessId: req.params.id,
                approvalStatusByAdmin: approvalStatusByAdmin
            });
        }
        // update YogaStudioBusiness anyUpdateRequest
        if (req.instructor) {
            await YogaStudioBusiness.update({ anyUpdateRequest: true },{ where: { id: req.params.id } });
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

exports.changeYogaStudioImageStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { approvalStatusByAdmin } = req.body;
        // Find image In Database
        const image = await YogaStudioImage.findOne({
            where: {
                id: req.params.id,
                deletedThrough: null
            }
        });
        if (!image) {
            return res.status(400).send({
                success: false,
                message: "This studio image is not present!"
            });
        }
        // Find is perent business approved In Database
        const business = await YogaStudioBusiness.findOne({
            where: {
                id: image.businessId
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
        await image.update({
            ...image,
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
            message: `Yoga studio image ${approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};