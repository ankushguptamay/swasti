const db = require('../../../Models');
const Instructor = db.instructor;
const InstructorQualification = db.insturctorQualification;
const InstructorExperience = db.instructorExperience;
const EmailOTP = db.emailOTP;
const EmailCredential = db.emailCredential;
const InstructorHistory = db.instructorHistory;
const { loginInstructor, registerInstructor, updateInstructor, verifyOTP, loginInstructorByNumber, verifyNumberOTP } = require("../../../Middleware/Validate/validateInstructor");
const { INSTRUCTOR_JWT_SECRET_KEY, JWT_VALIDITY, OTP_DIGITS_LENGTH, OTP_VALIDITY_IN_MILLISECONDS } = process.env;
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { deleteMultiFile, deleteSingleFile } = require("../../../Util/deleteFile");
const { capitalizeFirstLetter } = require("../../../Util/capitalizeFirstLetter");
const generateOTP = require("../../../Util/generateOTP");
const { sendEmail } = require("../../../Util/sendEmail");
const { sendOTPToNumber } = require('../../../Util/sendOTPToMobileNumber');
const SALT = 10;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// register
// login
// changePassword
// getInstructor
// updateInstructor

// getAllInstructor
// getInstructorForAdmin
// registerInstructor
// softDeleteInstructor
// getAllSoftDeletedInstructor
// restoreInstructor

exports.register = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerInstructor(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check is present 
        const isInstructor = await Instructor.findOne({
            paranoid: false,
            where: {
                [Op.or]: [
                    { email: req.body.email },
                    { phoneNumber: req.body.phoneNumber }
                ]
            }
        });
        if (isInstructor) {
            return res.status(400).send({
                success: false,
                message: "This credentials already exist!"
            });
        }
        // generate employee code
        let code;
        const isInstructorCode = await Instructor.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isInstructorCode.length == 0) {
            code = "INST" + 1000;
        } else {
            let lastInstructorCode = isInstructorCode[isInstructorCode.length - 1];
            let lastDigits = lastInstructorCode.instructorCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "INST" + incrementedDigits;
        }
        const name = capitalizeFirstLetter(req.body.name);
        // Create instructor in database
        const instructor = await Instructor.create({
            email: req.body.email,
            name: name,
            phoneNumber: req.body.phoneNumber,
            instructorCode: code
        });
        // Generate OTP for Email
        const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
        // Update sendEmail 0 every day
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        const changeUpdateDate = await EmailCredential.findAll({
            where: {
                updatedAt: { [Op.lt]: todayDate }
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        for (let i = 0; i < changeUpdateDate.length; i++) {
            // console.log("hii");
            await EmailCredential.update({
                emailSend: 0
            }, {
                where: {
                    id: changeUpdateDate[i].id
                }
            });
        }
        // finalise email credentiel
        const emailCredential = await EmailCredential.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        let finaliseEmailCredential;
        for (let i = 0; i < emailCredential.length; i++) {
            if (parseInt(emailCredential[i].emailSend) < 300) {
                finaliseEmailCredential = emailCredential[i];
                break;
            }
        }
        if (finaliseEmailCredential) {
            if (finaliseEmailCredential.plateForm === "BREVO") {
                const options = {
                    brevoEmail: finaliseEmailCredential.email,
                    brevoKey: finaliseEmailCredential.EMAIL_API_KEY,
                    headers: { "Swasti verification OTP": "123A" },
                    subject: "Registration",
                    htmlContent: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verification Card</title>
                            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap">
                        <style>
                            body {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                                font-family: 'Poppins', sans-serif;
                            }
                            .verification-card {
                                padding: 30px;
                                border: 1px solid #ccc;
                                box-shadow: 0 0 10px rgba(0, 0, 255, 0.1);
                                max-width: 400px;
                                width: 100%;
                                font-family: 'Poppins', sans-serif;
                            }
                            .logo-img {
                                max-width: 100px;
                                height: auto;
                            }
                            .otp-container{
                                font-size: 32px;
                                font-weight: bold;
                                text-align:center;
                                color:#1c2e4a;
                                font-family: 'Poppins', sans-serif;
                              }
                            .horizontal-line {
                                border-top: 1px solid #ccc;
                                margin: 15px 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="verification-card">
                            <img src="https://images.unsplash.com/photo-1636051028886-0059ad2383c8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Logo" class="logo-img">
                            <p style='font-size:14px'>Hi <span style=" font-weight:600">${req.body.email},</span></p>
                            <p style='font-size:14px;'>Please copy the One Time Password (OTP) below and enter it in the verification page on the Swasti.</p>
                             <div class="horizontal-line"></div>
                             <p class="otp-container"> ${otp}</p>
                            <div class="horizontal-line"></div>
                            
                            <p style='font-size:14px;'>This code <span style="font-weight:600;" >expires in ${parseInt(OTP_VALIDITY_IN_MILLISECONDS) / 1000 / 60} minutes.</span>Please,  <span style="font-weight:600;" >DONOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                              <div class="horizontal-line"></div>
                        </div>
                    </body>
                    </html>`,
                    userEmail: req.body.email,
                    userName: req.body.name
                }
                const response = await sendEmail(options);
                console.log(response);
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
            //  Store OTP
            await EmailOTP.create({
                vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
                otp: otp,
                receiverId: instructor.id
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)} minutes!`,
            data: { email: req.body.email }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.login = async (req, res) => {
    try {
        // Validate Body
        const { error } = loginInstructor(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check is present 
        const isInstructor = await Instructor.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!isInstructor) {
            return res.status(400).send({
                success: false,
                message: "This credentials is not present!"
            });
        }
        // Generate OTP for Email
        const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
        // Update sendEmail 0 every day
        const date = JSON.stringify(new Date());
        const todayDate = `${date.slice(1, 11)}`;
        const changeUpdateDate = await EmailCredential.findAll({
            where: {
                updatedAt: { [Op.lt]: todayDate }
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        for (let i = 0; i < changeUpdateDate.length; i++) {
            // console.log("hii");
            await EmailCredential.update({
                emailSend: 0
            }, {
                where: {
                    id: changeUpdateDate[i].id
                }
            });
        }
        // finalise email credentiel
        const emailCredential = await EmailCredential.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        let finaliseEmailCredential;
        for (let i = 0; i < emailCredential.length; i++) {
            if (parseInt(emailCredential[i].emailSend) < 300) {
                finaliseEmailCredential = emailCredential[i];
                break;
            }
        }
        if (finaliseEmailCredential) {
            if (finaliseEmailCredential.plateForm === "BREVO") {
                const options = {
                    brevoEmail: finaliseEmailCredential.email,
                    brevoKey: finaliseEmailCredential.EMAIL_API_KEY,
                    headers: { "Swasti verification OTP": "123A" },
                    subject: "Login to swasti",
                    htmlContent: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verification Card</title>
                            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap">
                        <style>
                            body {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                                font-family: 'Poppins', sans-serif;
                            }
                            .verification-card {
                                padding: 30px;
                                border: 1px solid #ccc;
                                box-shadow: 0 0 10px rgba(0, 0, 255, 0.1);
                                max-width: 400px;
                                width: 100%;
                                font-family: 'Poppins', sans-serif;
                            }
                            .logo-img {
                                max-width: 100px;
                                height: auto;
                            }
                            .otp-container{
                                font-size: 32px;
                                font-weight: bold;
                                text-align:center;
                                color:#1c2e4a;
                                font-family: 'Poppins', sans-serif;
                              }
                            .horizontal-line {
                                border-top: 1px solid #ccc;
                                margin: 15px 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="verification-card">
                            <img src="https://images.unsplash.com/photo-1636051028886-0059ad2383c8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Logo" class="logo-img">
                            <p style='font-size:14px'>Hi <span style=" font-weight:600">${req.body.email},</span></p>
                            <p style='font-size:14px;'>Please copy the One Time Password (OTP) below and enter it in the verification page on the  Swasti.</p>
                             <div class="horizontal-line"></div>
                             <p class="otp-container"> ${otp}</p>
                            <div class="horizontal-line"></div>
                            
                            <p style='font-size:14px;'>This code <span style="font-weight:600;" >expires in ${parseInt(OTP_VALIDITY_IN_MILLISECONDS) / 1000 / 60} minutes.</span>Please,  <span style="font-weight:600;" >DONOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                              <div class="horizontal-line"></div>
                        </div>
                    </body>
                    </html>`,
                    userEmail: req.body.email,
                    userName: isInstructor.name
                }
                const response = await sendEmail(options);
                console.log(response);
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
            //  Store OTP
            await EmailOTP.create({
                vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
                otp: otp,
                receiverId: isInstructor.id
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)} minutes!`,
            data: { email: req.body.email }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        // Validate body
        const { error } = verifyOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, otp } = req.body;
        // Is Email Otp exist
        const isOtp = await EmailOTP.findOne({
            where: {
                otp: otp
            }
        });
        if (!isOtp) {
            return res.status(400).send({
                success: false,
                message: `Invalid OTP!`
            });
        }
        // Checking is user present or not
        const instructor = await Instructor.findOne({
            where: {
                [Op.and]: [
                    { email: email }, { id: isOtp.receiverId }
                ]
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "No Details Found. Register Now!"
            });
        }
        // is email otp expired?
        const isOtpExpired = new Date().getTime() > parseInt(isOtp.vallidTill);
        if (isOtpExpired) {
            await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
            return res.status(400).send({
                success: false,
                message: `OTP expired!`
            });
        }
        await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: instructor.id,
                email: email,
                phoneNumber: instructor.phoneNumber
            },
            INSTRUCTOR_JWT_SECRET_KEY,
            { expiresIn: JWT_VALIDITY } // five day
        );
        res.status(201).send({
            success: true,
            message: `Verified successfully!`,
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.getInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findOne({
            where: {
                [Op.and]: [
                    { id: req.instructor.id }, { email: req.instructor.email }, { phoneNumber: req.instructor.phoneNumber }
                ]
            },
            include: [{
                model: InstructorQualification,
                as: 'qualifications'
            }, {
                model: InstructorExperience,
                as: "experience"
            }]
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Instructor Profile Fetched successfully!",
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllInstructor = async (req, res) => {
    try {
        const { page, search } = req.query;
        // Pagination
        const limit = parseInt(req.query.limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * limit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { eamil: { [Op.substring]: search } },
                    { instructorCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Instructor.count({
            where: {
                [Op.and]: condition
            }
        });
        const instructor = await Instructor.findAll({
            limit: limit,
            offset: offSet,
            where: {
                [Op.and]: condition
            }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Instructor Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getInstructorForAdmin = async (req, res) => {
    try {
        const instructor = await Instructor.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: InstructorQualification,
                as: 'qualifications'
            }, {
                model: InstructorExperience,
                as: "experience"
            }],
            paranoid: false
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: 'Instructor is not present!'
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Instructor Profile Fetched successfully!",
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.registerInstructor = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerInstructor(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check is present 
        const isInstructor = await Instructor.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            }
        });
        if (isInstructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is already present!"
            });
        }
        // generate employee code
        let code;
        const isInstructorCode = await Instructor.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isInstructorCode.length == 0) {
            code = "INST" + 1000;
        } else {
            let lastInstructorCode = isInstructorCode[isInstructorCode.length - 1];
            let lastDigits = lastInstructorCode.instructorCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "INST" + incrementedDigits;
        }
        // Create instructor in database
        const instructor = await Instructor.create({
            ...req.body,
            instructorCode: code,
            createdBy: "Admin"
        });
        // Email or SMS to Insturctor
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Instructor Registered successfully!'
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteInstructor = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const instructor = await Instructor.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is not present!"
            });
        }
        // soft delete
        await instructor.destroy();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Instructor Profile [${instructor.instructorCode}] soft deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.restoreInstructor = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const instructor = await Instructor.findOne({
            paranoid: false,
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is not present in soft delete!"
            });
        }
        // restore
        await instructor.restore();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Instructor Profile [${instructor.instructorCode}] restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllSoftDeletedInstructor = async (req, res) => {
    try {
        const { page, search } = req.query;
        // Pagination
        const limit = parseInt(req.query.limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * limit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [{
            deletedAt: { [Op.ne]: null }
        }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { eamil: { [Op.substring]: search } },
                    { instructorCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Instructor.count({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        const instructor = await Instructor.findAll({
            limit: limit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Deleted Instructor's Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.updateInstructor = async (req, res) => {
    try {
        // Validate Body
        const { error } = updateInstructor(req.body);
        if (error) {
            if (req.file) {
                deleteSingleFile(req.file.path);
            }
            return res.status(400).send(error.details[0].message);
        }
        // Check perticular instructor present in database
        const instructor = await Instructor.findOne({
            where: {
                [Op.and]: [
                    { id: req.instructor.id }, { email: req.instructor.email }, { phoneNumber: req.instructor.phoneNumber }
                ]
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is not present!"
            });
        }
        const { bio, socialMediaLink, location, twitter_x, facebook, instagram, linkedIn, languages, dateOfBirth } = req.body;
        const name = capitalizeFirstLetter(req.body.name);
        // store current data in history
        await InstructorHistory.create({
            name: instructor.name,
            email: instructor.email,
            cloudinaryFileId: instructor.cloudinaryFileId,
            phoneNumber: instructor.phoneNumber,
            instructorType: instructor.instructorType,
            bio: instructor.bio,
            socialMediaLink: instructor.socialMediaLink,
            location: instructor.location,
            instructorId: req.instructor.id,
            imagePath: instructor.imagePath,
            imageFileName: instructor.imageFileName,
            imageOriginalName: instructor.imageOriginalName,
            twitter_x: instructor.twitter_x,
            facebook: instructor.facebook,
            instagram: instructor.instagram,
            linkedIn: instructor.linkedIn,
            languages: instructor.languages,
            dateOfBirth: instructor.dateOfBirth
        });
        let image_Path = instructor.imagePath,
            imageFileName = instructor.imageFileName,
            imageOriginalName = instructor.imageOriginalName,
            cloudinaryFileId = instructor.cloudinaryFileId;
        if (req.file) {
            const imagePath = `./Resource/${req.file.filename}`;
            const response = await cloudinary.uploader.upload(imagePath);
            // delete file from resource/servere
            deleteSingleFile(req.file.path);
            cloudinaryFileId = response.public_id;
            image_Path = response.secure_url;
            imageFileName = req.file.filename;
            imageOriginalName = req.file.originalname
        }
        // Update 
        await instructor.update({
            name: name,
            bio: bio,
            cloudinaryFileId: cloudinaryFileId,
            socialMediaLink: socialMediaLink,
            location: location,
            imagePath: image_Path,
            imageFileName: imageFileName,
            imageOriginalName: imageOriginalName,
            twitter_x: twitter_x,
            facebook: facebook,
            instagram: instagram,
            linkedIn: linkedIn,
            languages: languages,
            dateOfBirth: dateOfBirth
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Instructor Profile updated successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.registerByNumber = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerInstructor(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check is present 
        const isInstructor = await Instructor.findOne({
            paranoid: false,
            where: {
                [Op.or]: [
                    { email: req.body.email },
                    { phoneNumber: req.body.phoneNumber }
                ]
            }
        });
        if (isInstructor) {
            return res.status(400).send({
                success: false,
                message: "This credentials already exist!!"
            });
        }
        // generate employee code
        let code;
        const isInstructorCode = await Instructor.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isInstructorCode.length == 0) {
            code = "INST" + 1000;
        } else {
            let lastInstructorCode = isInstructorCode[isInstructorCode.length - 1];
            let lastDigits = lastInstructorCode.instructorCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "INST" + incrementedDigits;
        }
        const name = capitalizeFirstLetter(req.body.name);
        // Create instructor in database
        const instructor = await Instructor.create({
            email: req.body.email,
            name: name,
            phoneNumber: req.body.phoneNumber,
            instructorCode: code
        });
        // Generate OTP for Email
        const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
        // Sending OTP to mobile number
        await sendOTPToNumber(req.body.phoneNumber, otp);
        //  Store OTP
        await EmailOTP.create({
            vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
            otp: otp,
            receiverId: instructor.id
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Registerd successfully!`,
            data: { phoneNumber: req.body.phoneNumber }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.loginByNumber = async (req, res) => {
    try {
        // Validate Body
        const { error } = loginInstructorByNumber(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check is present 
        const isInstructor = await Instructor.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            }
        });
        if (!isInstructor) {
            return res.status(400).send({
                success: false,
                message: "Not register!"
            });
        }
        // Generate OTP for Email
        const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
        // Sending OTP to mobile number
        await sendOTPToNumber(req.body.phoneNumber, otp);
        //  Store OTP
        await EmailOTP.create({
            vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
            otp: otp,
            receiverId: isInstructor.id
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `OTP send successfully! Valid for ${OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)} minutes!`,
            data: { phoneNumber: req.body.phoneNumber }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.verifyNumberOTP = async (req, res) => {
    try {
        // Validate body
        const { error } = verifyNumberOTP(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { phoneNumber, otp } = req.body;
        // Is Email Otp exist
        const isOtp = await EmailOTP.findOne({
            where: {
                otp: otp
            }
        });
        if (!isOtp) {
            return res.status(400).send({
                success: false,
                message: `Invalid OTP!`
            });
        }
        // Checking is user present or not
        const instructor = await Instructor.findOne({
            where: {
                [Op.and]: [
                    { phoneNumber: phoneNumber }, { id: isOtp.receiverId }
                ]
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "No Details Found. Register Now!"
            });
        }
        // is email otp expired?
        const isOtpExpired = new Date().getTime() > parseInt(isOtp.vallidTill);
        if (isOtpExpired) {
            await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
            return res.status(400).send({
                success: false,
                message: `OTP expired!`
            });
        }
        await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: instructor.id,
                email: instructor.email,
                phoneNumber: phoneNumber
            },
            INSTRUCTOR_JWT_SECRET_KEY,
            { expiresIn: JWT_VALIDITY } // five day
        );
        res.status(201).send({
            success: true,
            message: `Verified successfully!`,
            authToken: authToken
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};
