const db = require('../../../Models');
const Student = db.student;
const StudentProfile = db.studentProfile;
const EmailOTP = db.emailOTP;
const EmailCredential = db.emailCredential;
const CourseReview = db.courseReview;
const Chakra = db.chakra;
const ReferralHistory = db.referralHistory;
const StudentWallet = db.studentWallet;
const InstructorReview = db.instructorReview;
const { registerStudent, verifyOTPByLandingPage, registerByLandingPage } = require("../../../Middleware/Validate/validateStudent");
const { loginInstructor, verifyOTP, loginInstructorByNumber, verifyNumberOTP } = require("../../../Middleware/Validate/validateInstructor");
const { capitalizeFirstLetter } = require("../../../Util/capitalizeFirstLetter");
const { STUDENT_JWT_SECRET_KEY, JWT_VALIDITY, OTP_DIGITS_LENGTH, OTP_VALIDITY_IN_MILLISECONDS } = process.env;
const jwt = require("jsonwebtoken");
const generateOTP = require("../../../Util/generateOTP");
const { sendEmail } = require("../../../Util/sendEmail");
const { sendOTPToNumber } = require('../../../Util/sendOTPToMobileNumber');
const { Op } = require("sequelize");

// register
// login
// verifyOtp
// getStudent

// getAllStudent
// getStudentForAdmin
// registerStudent
// softDeleteStudent
// restoreStudent
// verifyStudent

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getTodayTime() {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const option = {
        timeZone: timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    const time = new Intl.DateTimeFormat([], option)
    return time.format(new Date());
}

function getRandomIntInclusive(max, exclude) {
    const num = Math.floor(Math.random() * max);
    return (num + 1 === exclude) ? getRandomInt(max) : num + 1
}

exports.register = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerStudent(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { referralCode } = req.body;
        // Check in paranoid true
        const paranoidTrue = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        if (paranoidTrue) {
            return res.status(400).send({
                success: false,
                message: "Student is already present!"
            });
        }
        // Check in paranoid false
        const paranoidFalse = await Student.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            }
        });
        if (paranoidFalse) {
            return res.status(400).send({
                success: false,
                message: "This student is blocked! Please contact to Swasti!"
            });
        }
        // generate employee code
        let code;
        const isStudentCode = await Student.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isStudentCode.length == 0) {
            code = "STUD" + 1000;
        } else {
            let lastStudentCode = isStudentCode[isStudentCode.length - 1];
            let lastDigits = lastStudentCode.studentCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "STUD" + incrementedDigits;
        }
        // capitalize name
        let name = null;
        if (req.body.name) {
            name = capitalizeFirstLetter(req.body.name);
        }
        const num = getRandomInt(7);
        // Create student in database
        const student = await Student.create({
            name: name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            studentCode: code,
            referralCode: referralCode,
            chakraBreakNumber: num + 1
        });
        // Creating Wallet
        await StudentWallet.create({
            studentId: student.id
        });
        // Create Chakra
        const chakraName = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
        for (let i = 0; i < chakraName.length; i++) {
            await Chakra.create({
                chakraName: chakraName[i],
                chakraNumber: i + 1,
                quantity: 0,
                ownerId: student.id
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
                    subject: "Registration",
                    htmlContent: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Verification Card</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f4f5ff;">
                        <center>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td align="center" style="padding: 20px 0; background-color: #f4f5ff;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="80%" style="max-width: 400px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                            <tr>
                                                <td style="padding: 30px;">
                                                    <div style="text-align: center;">
                                                        <img src="https://affiliate.techastute.in/static/media/swasti-logo.a3eb5cda3f2f3af4a459.jpg" alt="Logo" width="100" style="max-width: 100px; height: auto;">
                                                    </div>
                                                    <p style="font-size: 14px; font-family: verdana; color: #333; margin: 15px 0;">Hi <span style="font-weight: 600; color: #333;">${req.body.email},</span></p>
                                                    <p style="font-size: 14px; font-family: verdana; color: #333;">Please copy the One Time Password (OTP) below and enter it on the verification page of Swasti.</p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p style="font-size: 32px; font-weight: bold; text-align: center; color: #1c2e4a; margin: 20px 0;">${otp}</p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p style="font-size: 14px; font-family: verdana; color: #333;">This code <span style="font-weight: 600; color: #333;">expires in ${parseInt(OTP_VALIDITY_IN_MILLISECONDS) / 1000 / 60} minutes.</span> Please, <span style="font-weight: 600; color: #333;">DO NOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p  style="font-size: 14px; text-align: center; color: #666;">Powered by Your Company | Address | Contact Information</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </center>
                    </body>
                    </html>`,
                    userEmail: req.body.email,
                    userName: req.body.name ? req.body.name : "User"
                }
                const response = await sendEmail(options);
                // console.log(response);
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
            //  Store OTP
            await EmailOTP.create({
                vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
                otp: otp,
                receiverId: student.id
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)} minutes!`,
            data: {
                email: req.body.email
            }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        // Validate Body
        const { error } = loginInstructor(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        // If Email is already present
        const student = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Invalid credentials!"
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
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f4f5ff;">
                        <center>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td align="center" style="padding: 20px 0; background-color: #f4f5ff;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="80%" style="max-width: 400px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                            <tr>
                                                <td style="padding: 30px;">
                                                    <div style="text-align: center;">
                                                        <img src="https://affiliate.techastute.in/static/media/swasti-logo.a3eb5cda3f2f3af4a459.jpg" alt="Logo" width="100" style="max-width: 100px; height: auto;">
                                                    </div>
                                                    <p style="font-size: 14px; font-family: verdana; color: #333; margin: 15px 0;">Hi <span style="font-weight: 600; color: #333;">${req.body.email},</span></p>
                                                    <p style="font-size: 14px; font-family: verdana; color: #333;">Please copy the One Time Password (OTP) below and enter it on the verification page of Swasti.</p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p style="font-size: 32px; font-weight: bold; text-align: center; color: #1c2e4a; margin: 20px 0;">${otp}</p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p style="font-size: 14px; font-family: verdana; color: #333;">This code <span style="font-weight: 600; color: #333;">expires in ${parseInt(OTP_VALIDITY_IN_MILLISECONDS) / 1000 / 60} minutes.</span> Please, <span style="font-weight: 600; color: #333;">DO NOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                                                    <hr style="border-top: 1px solid #ddd; margin: 15px 0;">
                                                    <p  style="font-size: 14px; text-align: center; color: #666;">Powered by Your Company | Address | Contact Information</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </center>
                    </body>
                    </html>`,
                    userEmail: req.body.email,
                    userName: student.name
                }
                const response = await sendEmail(options);
                console.log(response);
                const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
                console.log(increaseNumber);
                await EmailCredential.update({
                    emailSend: increaseNumber
                }, { where: { id: finaliseEmailCredential.id } });
            }
            //  Store OTP
            await EmailOTP.create({
                vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
                otp: otp,
                receiverId: student.id
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: `OTP send to email successfully! Valid for ${OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)} minutes!`,
            data: {
                email: req.body.email
            }
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

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
        const student = await Student.findOne({
            where: {
                [Op.and]: [
                    { email: email }, { id: isOtp.receiverId }
                ]
            }
        });
        if (!student) {
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
        // Chakra
        if (!student.isOTPVerify) {
            await student.update({ ...student, isOTPVerify: true });
            if (student.referralCode) {
                const referral = await Student.findOne({
                    where: {
                        studentCode: student.referralCode
                    }
                });
                if (referral) {
                    const chakraBreakNumber = parseInt(referral.chakraBreakNumber);
                    const chakras = await Chakra.findAll({
                        where: {
                            ownerId: referral.id
                        },
                        order: [
                            ['chakraNumber', 'ASC']
                        ]
                    });
                    let totalChakraQuantity = 0;
                    for (let i = 0; i < chakras.length; i++) {
                        totalChakraQuantity = totalChakraQuantity + parseInt(chakras[i].quantity);
                    }
                    let specialNum;
                    if (totalChakraQuantity <= 20) {
                        specialNum = getRandomIntInclusive(7, chakraBreakNumber);
                    } else {
                        specialNum = getRandomInt(7);
                    }
                    const specialChakra = await Chakra.findOne({ where: { ownerId: referral.id, chakraNumber: parseInt(specialNum) } });
                    const newQuantity = parseInt(specialChakra.quantity) + 1;
                    await specialChakra.update({ ...specialChakra, quantity: newQuantity });
                    const date = getTodayTime();
                    await ReferralHistory.create({
                        chakraNumber: specialNum,
                        joinerName: student.name,
                        date: date,
                        joinerId: student.id,
                        ownerId: referral.id
                    });
                }
            }
        }
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: student.id,
                email: email,
                phoneNumber: student.phoneNumber
            },
            STUDENT_JWT_SECRET_KEY,
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

exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            where: {
                [Op.and]: [
                    { id: req.student.id }, { email: req.student.email }
                ]
            },
            include: [{
                model: StudentProfile,
                as: "profile"
            }]
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Student Profile Fetched successfully!",
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllStudent = async (req, res) => {
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
                    { email: { [Op.substring]: search } },
                    { studentCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Student.count({
            where: {
                [Op.and]: condition
            }
        });
        const student = await Student.findAll({
            limit: limit,
            offset: offSet,
            where: {
                [Op.and]: condition
            }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Student Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getStudentForAdmin = async (req, res) => {
    try {
        const student = await Student.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: StudentProfile,
                as: "profile"
            }],
            paranoid: false
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: 'Student is not present!'
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Student Profile Fetched successfully!",
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.softDeleteStudent = async (req, res) => {
    try {
        // Check perticular student present in database
        const student = await Student.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Student is not present!"
            });
        }
        // soft delete
        await student.destroy();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student Profile [${student.studentCode}] soft deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.restoreStudent = async (req, res) => {
    try {
        // Check perticular student present in database
        const student = await Student.findOne({
            paranoid: false,
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Student is not present in soft delete!"
            });
        }
        // restore
        await student.restore();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student Profile [${student.studentCode}] restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllDeletedStudent = async (req, res) => {
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
        const condition = [
            { deletedAt: { [Op.ne]: null } }
        ];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { eamil: { [Op.substring]: search } },
                    { studentCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Student.count({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        const student = await Student.findAll({
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
            message: "Deleted Student's Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.registerStudent = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerStudent(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { referralCode } = req.body;
        // Check in paranoid true
        const paranoidTrue = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        if (paranoidTrue) {
            return res.status(400).send({
                success: false,
                message: "Student is already present!"
            });
        }
        // Check in paranoid false
        const paranoidFalse = await Student.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            }
        });
        if (paranoidFalse) {
            return res.status(400).send({
                success: false,
                message: "Student is present in soft delete!",
                data: paranoidFalse
            });
        }
        // generate employee code
        let code;
        const isStudentCode = await Student.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isStudentCode.length == 0) {
            code = "STUD" + 1000;
        } else {
            let lastStudentCode = isStudentCode[isStudentCode.length - 1];
            let lastDigits = lastStudentCode.studentCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "STUD" + incrementedDigits;
        }
        const num = getRandomInt(7);
        // Create student in database
        const student = await Student.create({
            ...req.body,
            studentCode: code,
            createdBy: "Admin",
            referralCode: referralCode,
            chakraBreakNumber: num + 1
        });
        // Creating Wallet
        await StudentWallet.create({
            studentId: student.id
        });
        // Create Chakra
        const chakraName = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
        for (let i = 0; i < chakraName.length; i++) {
            await Chakra.create({
                chakraName: chakraName[i],
                chakraNumber: i + 1,
                quantity: 0,
                ownerId: student.id
            });
        }
        // Email or SMS to Student
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Registered successfully!'
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.verifyOTPByLandingPage = async (req, res) => {
    try {
        // Validate body
        const { error } = verifyOTPByLandingPage(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { email, otp, location, phoneNumber } = req.body;
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
        const student = await Student.findOne({
            where: {
                [Op.and]: [
                    { email: email }, { id: isOtp.receiverId }
                ]
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "This credentials do not exist!"
            });
        }
        const name = capitalizeFirstLetter(req.body.name);
        await student.update({
            ...student,
            name: name,
            phoneNumber: phoneNumber,
            location: location
        });
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
                id: student.id,
                email: email,
                phoneNumber: student.phoneNumber
            },
            STUDENT_JWT_SECRET_KEY,
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

exports.hardDeleteStudent = async (req, res) => {
    try {
        // Check perticular student present in database
        const student = await Student.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Student is not present!"
            });
        }
        //hard delete StudentProfile , picture should be deleted from
        await StudentProfile.destroy({ where: { studentId: req.params.id }, force: true });
        //hard delete student reviews
        await InstructorReview.destroy({ where: { reviewerId: req.params.id }, force: true });
        //hard delete course reviews
        await CourseReview.destroy({ where: { reviewerId: req.params.id }, force: true });
        // hard delete
        await student.destroy({ force: true });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student Profile [${student.studentCode}] hard deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.heartAPI = async (req, res) => {
    try {
        await Student.findOne({
            where: {
                id: "bsdhabsidjfei"
            }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Heart API fired successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.registerByLandingPage = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerByLandingPage(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check in paranoid true
        const isStudent = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        let authToken;
        if (isStudent) {
            // generate JWT Token
            authToken = jwt.sign(
                {
                    id: isStudent.id,
                    email: req.body.email,
                    phoneNumber: isStudent.phoneNumber
                },
                STUDENT_JWT_SECRET_KEY,
                { expiresIn: JWT_VALIDITY } // five day
            );
        } else {
            // Check in paranoid false
            const paranoidFalse = await Student.findOne({
                paranoid: false,
                where: {
                    email: req.body.email
                }
            });
            if (paranoidFalse) {
                return res.status(400).send({
                    success: false,
                    message: "This student is blocked! Please contact to Swasti!"
                });
            }
            // generate employee code
            let code;
            const isStudentCode = await Student.findAll({
                paranoid: false,
                order: [
                    ['createdAt', 'ASC']
                ]
            });
            if (isStudentCode.length == 0) {
                code = "STUD" + 1000;
            } else {
                let lastStudentCode = isStudentCode[isStudentCode.length - 1];
                let lastDigits = lastStudentCode.studentCode.substring(4);
                let incrementedDigits = parseInt(lastDigits, 10) + 1;
                code = "STUD" + incrementedDigits;
            }
            // capitalize name
            const name = capitalizeFirstLetter(req.body.name);
            // Create student in database
            const student = await Student.create({
                name: name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                studentCode: code,
                location: req.body.location
            });
            // generate JWT Token
            authToken = jwt.sign(
                {
                    id: student.id,
                    email: req.body.email,
                    phoneNumber: isStudent.phoneNumber
                },
                STUDENT_JWT_SECRET_KEY,
                { expiresIn: JWT_VALIDITY } // five day
            );
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student registered successfully!`,
            authToken: authToken
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.registerByNumber = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerStudent(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { referralCode } = req.body;
        // Check is present 
        const isStudent = await Student.findOne({
            paranoid: false,
            where: {
                [Op.or]: [
                    { email: req.body.email },
                    { phoneNumber: req.body.phoneNumber }
                ]
            }
        });
        if (isStudent) {
            return res.status(400).send({
                success: false,
                message: "This credentials already exist!!"
            });
        }
        // generate employee code
        // generate employee code
        let code;
        const isStudentCode = await Student.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isStudentCode.length == 0) {
            code = "STUD" + 1000;
        } else {
            let lastStudentCode = isStudentCode[isStudentCode.length - 1];
            let lastDigits = lastStudentCode.studentCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "STUD" + incrementedDigits;
        }
        const name = capitalizeFirstLetter(req.body.name);
        const num = getRandomInt(7);
        // Create student in database
        const student = await Student.create({
            email: req.body.email,
            name: name,
            phoneNumber: req.body.phoneNumber,
            studentCode: code,
            referralCode: referralCode,
            chakraBreakNumber: num + 1
        });
        // Creating Wallet
        await StudentWallet.create({
            studentId: student.id
        });
        // Create Chakra
        const chakraName = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
        for (let i = 0; i < chakraName.length; i++) {
            await Chakra.create({
                chakraName: chakraName[i],
                chakraNumber: i + 1,
                quantity: 0,
                ownerId: student.id
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
            receiverId: student.id
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
        const isStudent = await Student.findOne({
            where: {
                phoneNumber: req.body.phoneNumber
            }
        });
        if (!isStudent) {
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
            receiverId: isStudent.id
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
        const student = await Student.findOne({
            where: {
                [Op.and]: [
                    { phoneNumber: phoneNumber }, { id: isOtp.receiverId }
                ]
            }
        });
        if (!student) {
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
        // Chakra
        if (!student.isOTPVerify) {
            await student.update({ ...student, isOTPVerify: true });
            if (student.referralCode) {
                const referral = await Student.findOne({
                    where: {
                        studentCode: student.referralCode
                    }
                });
                if (referral) {
                    const chakraBreakNumber = parseInt(referral.chakraBreakNumber);
                    const chakras = await Chakra.findAll({
                        where: {
                            ownerId: referral.id
                        },
                        order: [
                            ['chakraNumber', 'ASC']
                        ]
                    });
                    let totalChakraQuantity = 0;
                    for (let i = 0; i < chakras.length; i++) {
                        totalChakraQuantity = totalChakraQuantity + parseInt(chakras[i].quantity);
                    }
                    let specialNum;
                    if (totalChakraQuantity <= 20) {
                        specialNum = getRandomIntInclusive(7, chakraBreakNumber);
                    } else {
                        specialNum = getRandomInt(7);
                    }
                    const specialChakra = await Chakra.findOne({ where: { ownerId: referral.id, chakraNumber: parseInt(specialNum) } });
                    const newQuantity = parseInt(specialChakra.quantity) + 1;
                    await specialChakra.update({ ...specialChakra, quantity: newQuantity });
                    const date = getTodayTime();
                    await ReferralHistory.create({
                        chakraNumber: specialNum,
                        joinerName: student.name,
                        date: date,
                        joinerId: student.id,
                        ownerId: referral.id
                    });
                }
            }
        }
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: student.id,
                email: student.email,
                phoneNumber: phoneNumber
            },
            STUDENT_JWT_SECRET_KEY,
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

exports.getMyChakra = async (req, res) => {
    try {
        const chakra = await Chakra.findAll({
            where: {
                [Op.and]: [
                    { ownerId: req.student.id }
                ]
            },
            order: [
                ['chakraNumber', 'ASC']
            ]
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Chakra fetched successfully!`,
            data: chakra
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getReferralData = async (req, res) => {
    try {
        const referral = await ReferralHistory.findAll({
            where: {
                ownerId: req.student.id
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Referral data fetched successfully!`,
            data: referral
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}