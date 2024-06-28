const db = require('../../Models');
const { Op } = require("sequelize");
const { homeTutorValidation, hTutorLocationValidation, hTutorTimeSloteValidation } = require('../../Middleware/Validate/validateHomeTutor');
const { deleteSingleFile } = require("../../Util/deleteFile");
const generateOTP = require("../../Util/generateOTP");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createHomeTutor = async (req, res) => {
    try {
        // Validate Body
        const { error } = homeTutorValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { isPrivateSO, isGroupSO, language, yogaFor, homeTutorName, privateSessionPrice_Day, privateSessionPrice_Month, groupSessionPrice_Day, groupSessionPrice_Month, specilization, instructorBio } = req.body;
        // Validate price with there offer
        if (isGroupSO === true) {
            if (groupSessionPrice_Day && groupSessionPrice_Month) {
            } else {
                return res.status(400).send({
                    success: false,
                    message: "Please enter required group class price!"
                });
            }
        }
        if (isPrivateSO === true) {
            if (privateSessionPrice_Day && privateSessionPrice_Month) {
            } else {
                return res.status(400).send({
                    success: false,
                    message: "Please enter required individual class price!"
                });
            }
        }
        if (!isPrivateSO && !isGroupSO) {
            return res.status(400).send({
                success: false,
                message: "Please select atleast one service offered!"
            });
        }

        // Store in database
        const homeTutor = await HomeTutor.create({
            yogaFor: yogaFor,
            homeTutorName: homeTutorName,
            isPrivateSO: isPrivateSO,
            isGroupSO: isGroupSO,
            language: language,
            privateSessionPrice_Day: privateSessionPrice_Day,
            privateSessionPrice_Month: privateSessionPrice_Month,
            groupSessionPrice_Day: groupSessionPrice_Day,
            groupSessionPrice_Month: groupSessionPrice_Month,
            specilization: specilization,
            instructorBio: instructorBio,
            instructorId: req.instructor.id,
            approvalStatusByAdmin: null
        });
        // create update history
        await HomeTutorHistory.create({
            yogaFor: yogaFor,
            homeTutorName: homeTutorName,
            isPrivateSO: isPrivateSO,
            isGroupSO: isGroupSO,
            language: language,
            privateSessionPrice_Day: privateSessionPrice_Day,
            privateSessionPrice_Month: privateSessionPrice_Month,
            groupSessionPrice_Day: groupSessionPrice_Day,
            groupSessionPrice_Month: groupSessionPrice_Month,
            specilization: specilization,
            instructorBio: instructorBio,
            homeTutorId: homeTutor.id,
            updatedBy: "Instructor"
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Home Tutor created successfully!",
            data: { homeTutorId: homeTutor.id }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addHTutorSeviceArea = async (req, res) => {
    try {
        // Validate Body
        const { error } = hTutorLocationValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { locationName, latitude, longitude, radius, unit } = req.body;
        const homeTutorId = req.params.id;
        // Check is this home tutor present and created by same instructor
        const isHomeTutor = await HomeTutor.findOne({
            where: {
                id: homeTutorId,
                instructorId: req.instructor.id
            }
        });
        if (!isHomeTutor) {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present!"
            });
        }
        // Store in database
        await HTServiceArea.create({
            locationName: locationName,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: radius,
            unit: unit,
            homeTutorId: homeTutorId
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Sevice area added successfully!",
            data: { homeTutorId: homeTutorId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addHTutorTimeSlote = async (req, res) => {
    try {
        // Validate Body
        const { error } = hTutorTimeSloteValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { slotes, date } = req.body;
        const homeTutorId = req.params.id;
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
        // Check is this home tutor present and created by same instructor
        const isHomeTutor = await HomeTutor.findOne({
            where: {
                id: homeTutorId,
                instructorId: req.instructor.id
            }
        });
        if (!isHomeTutor) {
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present!"
            });
        }
        // 1.Today Date
        const dateFor = JSON.stringify(new Date((new Date).getTime() - (24 * 60 * 60 * 1000)));
        const today = `${date}T18:30:00.000Z`;
        // Get All Today Code
        let code;
        const indtructorNumb = (req.instructorCode).substring(4);
        const isSloteCode = await HTTimeSlot.findAll({
            where: {
                createdAt: { [Op.gt]: today },
                sloteCode: { [Op.startsWith]: indtructorNumb }
            },
            order: [
                ['createdAt', 'ASC']
            ],
            paranoid: false
        });
        const day = date.slice(8, 10);
        const year = date.slice(2, 4);
        const month = date.slice(5, 7);
        if (isSloteCode.length > 0) {
            code = (isSloteCode[isSloteCode.length - 1]).sloteCode;
        }
        // Store in database
        for (let i = 0; i < slotes.length; i++) {
            const otp = generateOTP.generateFixedLengthRandomNumber(process.env.OTP_DIGITS_LENGTH);
            // Generating Code
            const isSlote = await HTTimeSlot.findOne({
                where: {
                    time: slotes[i].time,
                    date: date,
                    homeTutorId: homeTutorId
                }
            });
            if (!isSlote) {
                if (!code) {
                    code = indtructorNumb + day + month + year + 1;
                } else {
                    const digit = indtructorNumb.length + 6;
                    let lastDigits = code.substring(digit);
                    let incrementedDigits = parseInt(lastDigits, 10) + 1;
                    code = indtructorNumb + day + month + year + incrementedDigits;
                }
                // Store in database
                if (slotes[i].serviceType === "Private") {
                    await HTTimeSlot.create({
                        date: date,
                        password: otp,
                        sloteCode: code,
                        serviceType: slotes[i].serviceType,
                        noOfPeople: 1,
                        time: slotes[i].time,
                        isBooked: false,
                        appointmentStatus: "Active",
                        homeTutorId: homeTutorId
                    });
                } else if (slotes[i].serviceType === "Group") {
                    await HTTimeSlot.create({
                        date: date,
                        password: otp,
                        serviceType: slotes[i].serviceType,
                        sloteCode: code,
                        noOfPeople: slotes[i].noOfPeople,
                        time: slotes[i].time,
                        isBooked: false,
                        appointmentStatus: "Active",
                        homeTutorId: homeTutorId
                    });
                }
            }
            // console.log(code);
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Time slote added successfully!",
            data: { homeTutorId: homeTutorId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addHTutorImage = async (req, res) => {
    try {
        // File should be exist
        if (!req.files) {
            return res.status(400).send({
                success: false,
                message: "Please..Upload image!"
            });
        }
        const homeTutorId = req.params.id;
        const files = req.files;
        // Check is this home tutor present and created by same instructor
        const isHomeTutor = await HomeTutor.findOne({
            where: {
                id: homeTutorId,
                instructorId: req.instructor.id
            }
        });
        if (!isHomeTutor) {
            // Delete File from server
            for (let i = 0; i < files.length; i++) {
                deleteSingleFile(files[i].path);
            }
            return res.status(400).send({
                success: false,
                message: "This home tutor is not present!"
            });
        }
        // console.log(files);
        // How mant file in already present
        const maxFileUpload = 3;
        const images = await HTutorImages.count({ where: { homeTutorId: homeTutorId, deletedThrough: null } });
        const fileCanUpload = maxFileUpload - parseInt(images);
        for (let i = 0; i < files.length; i++) {
            if (i < fileCanUpload) {
                const imagePath = `./Resource/${files[i].filename}`;
                const response = await cloudinary.uploader.upload(imagePath);
                await HTutorImages.create({
                    cloudinaryFileId: response.public_id,
                    originalName: files[i].originalname,
                    path: response.secure_url,
                    fileName: files[i].filename,
                    homeTutorId: homeTutorId
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
            message: `${fileCanUpload} home tutor images added successfully!`,
            data: { homeTutorId: homeTutorId }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};