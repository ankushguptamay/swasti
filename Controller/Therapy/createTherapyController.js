const db = require('../../Models');
const { Op } = require("sequelize");
const { therapyValidation, therapyLocationValidation, therapyTimeSloteValidation, therapyTypeOfferedValidation } = require('../../Middleware/Validate/validateTherapy');
const { deleteSingleFile } = require("../../Util/deleteFile");
const generateOTP = require("../../Util/generateOTP");
const Therapy = db.therapy;
const TherapyHistory = db.therapyHistory;
const TherayImages = db.therapyImage;
const TherapyOffered = db.therapyOffered;
const TherapyServiceArea = db.therapyServiceArea;
const TherapyTimeSlot = db.therapyTimeSlote;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createTherapy = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapyValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { language, studioLocation, specilization, instructorBio, latitude, longitude, pincode, therapistName } = req.body;
        // Store in database
        const therapy = await Therapy.create({
            therapistName: therapistName,
            language: language,
            specilization: specilization,
            instructorBio: instructorBio,
            instructorId: req.instructor.id,
            studioLocation: studioLocation,
            latitude: latitude,
            longitude: longitude,
            pincode: pincode,
            approvalStatusByAdmin: null
        });
        // create update history
        await TherapyHistory.create({
            therapistName: therapistName,
            language: language,
            specilization: specilization,
            instructorBio: instructorBio,
            instructorId: req.instructor.id,
            studioLocation: studioLocation,
            latitude: latitude,
            longitude: longitude,
            pincode: pincode,
            therapyId: therapy.id,
            updatedBy: "Instructor"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy created successfully!",
            data: { therapyId: therapy.id }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addTherapySeviceArea = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapyLocationValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { locationName, latitude, longitude, radius, unit } = req.body;
        const therapyId = req.params.id;
        // Check is this therapy present and created by same instructor
        const isTherapy = await Therapy.findOne({
            where: {
                id: therapyId,
                instructorId: req.instructor.id
            }
        });
        if (!isTherapy) {
            return res.status(400).send({
                success: false,
                message: "This therapy is not present!"
            });
        }
        // Store in database
        await TherapyServiceArea.create({
            locationName: locationName,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: radius,
            unit: unit,
            therapyId: therapyId
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Sevice area added successfully!",
            data: { therapyId: therapyId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addTherapyTimeSlote = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapyTimeSloteValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { date, time } = req.body;
        const therapyId = req.params.id;
        // 3 days validity
        const date1 = JSON.stringify(new Date());
        const date2 = JSON.stringify(new Date((new Date).getTime() + (1 * 24 * 60 * 60 * 1000)));
        const date3 = JSON.stringify(new Date((new Date).getTime() + (2 * 24 * 60 * 60 * 1000)));
        const array = [`${date1.slice(1, 11)}`, `${date2.slice(1, 11)}`, `${date3.slice(1, 11)}`]
        if (array.indexOf(date) === -1) {
            return res.status(400).send({
                success: false,
                message: "Can't create more then three days slote!"
            });
        }
        // Check is this therapy present and created by same instructor
        const isTherapy = await Therapy.findOne({
            where: {
                id: therapyId,
                instructorId: req.instructor.id
            }
        });
        if (!isTherapy) {
            return res.status(400).send({
                success: false,
                message: "This therapy is not present!"
            });
        }
        // Store in database
        for (let i = 0; i < time.length; i++) {
            const otp = generateOTP.generateFixedLengthRandomNumber(process.env.OTP_DIGITS_LENGTH);
            await TherapyTimeSlot.create({
                date: date,
                password: otp,
                time: time[i],
                isBooked: false,
                appointmentStatus: "Active",
                therapyId: therapyId
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Time slote added successfully!",
            data: { therapyId: therapyId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addTherapyImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.files) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload image!"
            });
        }
        const therapyId = req.params.id;
        const files = req.files;
        // Check is this therapy present and created by same instructor
        const isTherapy = await Therapy.findOne({
            where: {
                id: therapyId,
                instructorId: req.instructor.id
            }
        });
        if (!isTherapy) {
            // Delete File from server
            for (let i = 0; i < files.length; i++) {
                deleteSingleFile(files[i].path);
            }
            return res.status(400).send({
                success: false,
                message: "This therapy is not present!"
            });
        }
        // console.log(files);
        // How mant file in already present
        const maxFileUpload = 3;
        const images = await TherayImages.count({ where: { therapyId: therapyId, deletedThrough: null } });
        const fileCanUpload = maxFileUpload - parseInt(images);
        for (let i = 0; i < files.length; i++) {
            if (i < fileCanUpload) {
                const imagePath = `./Resource/${files[i].filename}`;
                const response = await cloudinary.uploader.upload(imagePath);
                await TherayImages.create({
                    cloudinaryFileId: response.public_id,
                    originalName: files[i].originalname,
                    path: response.secure_url,
                    fileName: files[i].filename,
                    therapyId: therapyId
                });
            }
        }
        // Delete File from server
        for (let i = 0; i < files.length; i++) {
            deleteSingleFile(files[i].path);
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: `${fileCanUpload} therapy images added successfully!`,
            data: { therapyId: therapyId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addTherapyTypeOffered = async (req, res) => {
    try {
        // Validate Body
        const { error } = therapyTypeOfferedValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { therapyName, isHomeSO, isStudioSO, isHomePrivateClass, isHomeGroupClass, isStudioPrivateClass, isStudioGroupClass, home_PrivateSessionPrice_Day, home_privateSessionPrice_Month,
            home_groupSessionPrice_Day, home_groupSessionPrice_Month, studio_PrivateSessionPrice_Day, studio_privateSessionPrice_Month, studio_groupSessionPrice_Day, studio_groupSessionPrice_Month } = req.body;
        const therapyId = req.params.id;
        // Check is this therapy present and created by same instructor
        const isTherapy = await Therapy.findOne({
            where: {
                id: therapyId,
                instructorId: req.instructor.id
            }
        });
        if (!isTherapy) {
            return res.status(400).send({
                success: false,
                message: "This therapy is not present!"
            });
        }
        // Validate Condition
        if (isHomeSO) {
            if (isHomeGroupClass) {
                if (home_groupSessionPrice_Day && home_groupSessionPrice_Month) {
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Please enter required home group class price!"
                    });
                }
            }
            if (isHomePrivateClass) {
                if (home_privateSessionPrice_Month && home_PrivateSessionPrice_Day) {
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Please enter required home private class price!"
                    });
                }
            }
        }
        if (isStudioSO) {
            if (isStudioGroupClass) {
                if (studio_groupSessionPrice_Day && studio_groupSessionPrice_Month) {
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Please enter required studio group class price!"
                    });
                }
            }
            if (isStudioPrivateClass) {
                if (studio_privateSessionPrice_Month && studio_PrivateSessionPrice_Day) {
                } else {
                    return res.status(400).send({
                        success: false,
                        message: "Please enter required studio private class price!"
                    });
                }
            }
        }
        // Store in Database
        await TherapyOffered.create({
            therapyName: therapyName,
            isHomeSO: isHomeSO,
            isHomeGroupClass: isHomeGroupClass,
            home_groupSessionPrice_Day: home_groupSessionPrice_Day,
            home_groupSessionPrice_Month: home_groupSessionPrice_Month,
            isHomePrivateClass: isHomePrivateClass,
            home_PrivateSessionPrice_Day: home_PrivateSessionPrice_Day,
            home_privateSessionPrice_Month: home_privateSessionPrice_Month,
            isStudioSO: isStudioSO,
            isStudioGroupClass: isStudioGroupClass,
            studio_groupSessionPrice_Day: studio_groupSessionPrice_Day,
            studio_groupSessionPrice_Month: studio_groupSessionPrice_Month,
            isStudioPrivateClass: isStudioPrivateClass,
            studio_PrivateSessionPrice_Day: studio_PrivateSessionPrice_Day,
            studio_privateSessionPrice_Month: studio_privateSessionPrice_Month,
            therapyId: therapyId
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Therapy created successfully!",
            data: { therapyId: therapyId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};