const db = require("../../../Models");
const Instructor = db.instructor;
const InstructorQualification = db.insturctorQualification;
const InstructorExperience = db.instructorExperience;
const EmailOTP = db.emailOTP;
const Chakra = db.chakra;
const IBankDetail = db.instructorBankDetails;
const IKYC = db.instructorKYC;
const ReferralHistory = db.referralHistory;
const InstructorWallet = db.instructorWallet;
const EmailCredential = db.emailCredential;
const InstructorHistory = db.instructorHistory;
const ServiceNotification = db.serviceNotification;
const {
  loginInstructor,
  registerInstructor,
  updateInstructor,
  verifyOTP,
  loginInstructorByNumber,
  verifyNumberOTP,
  homeTutorTerm,
  instructorTerm,
  therapistTerm,
  yogaStudioTerm,
} = require("../../../Middleware/Validate/validateInstructor");
const {
  SHOW_BUNNY_FILE_HOSTNAME,
  INSTRUCTOR_JWT_SECRET_KEY,
  JWT_VALIDITY,
  OTP_DIGITS_LENGTH,
  OTP_VALIDITY_IN_MILLISECONDS,
} = process.env;
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../../Util/deleteFile");
const { uploadFileToBunny } = require("../../../Util/bunny");
const {
  capitalizeFirstLetter,
} = require("../../../Util/capitalizeFirstLetter");
const generateOTP = require("../../../Util/generateOTP");
const { sendEmail } = require("../../../Util/sendEmail");
const { sendOTPToNumber } = require("../../../Util/sendOTPToMobileNumber");
const fs = require("fs");
const bunnyFolderName = "inst-doc";

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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getTodayTime() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const option = {
    timeZone: timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const time = new Intl.DateTimeFormat([], option);
  return time.format(new Date());
}

function getRandomIntInclusive(max, exclude) {
  const num = Math.floor(Math.random() * max);
  return num + 1 === exclude ? getRandomInt(max) : num + 1;
}

exports.register = async (req, res) => {
  try {
    // Validate Body
    const { error } = registerInstructor(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { referralCode } = req.body;
    // Check is present
    const isInstructor = await Instructor.findOne({
      paranoid: false,
      where: {
        [Op.or]: [
          { email: req.body.email },
          { phoneNumber: req.body.phoneNumber },
        ],
      },
    });
    if (isInstructor) {
      return res.status(400).send({
        success: false,
        message: "This credentials already exist!", // Redirect to login by email page
      });
    }
    // generate employee code
    let code;
    const isInstructorCode = await Instructor.findAll({
      paranoid: false,
      order: [["createdAt", "ASC"]],
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
    const num = getRandomInt(7);
    // Create instructor in database
    const instructor = await Instructor.create({
      email: req.body.email,
      name: name,
      phoneNumber: req.body.phoneNumber,
      instructorCode: code,
      referralCode: referralCode,
      chakraBreakNumber: num + 1,
    });
    // Creating Wallet
    await InstructorWallet.create({
      instructorId: instructor.id,
    });
    // Create Chakra
    const chakraName = [
      "Root",
      "Sacral",
      "Solar Plexus",
      "Heart",
      "Throat",
      "Third Eye",
      "Crown",
    ];
    for (let i = 0; i < chakraName.length; i++) {
      await Chakra.create({
        chakraName: chakraName[i],
        chakraNumber: i + 1,
        quantity: 0,
        ownerId: instructor.id,
      });
    }
    // Generate OTP for Email
    const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
    // Update sendEmail 0 every day
    const date = JSON.stringify(new Date());
    const todayDate = `${date.slice(1, 11)}`;
    const changeUpdateDate = await EmailCredential.findAll({
      where: {
        updatedAt: { [Op.lt]: todayDate },
      },
      order: [["createdAt", "ASC"]],
    });
    for (let i = 0; i < changeUpdateDate.length; i++) {
      // console.log("hii");
      await EmailCredential.update(
        {
          emailSend: 0,
        },
        {
          where: {
            id: changeUpdateDate[i].id,
          },
        }
      );
    }
    // finalise email credentiel
    const emailCredential = await EmailCredential.findAll({
      order: [["createdAt", "ASC"]],
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
                            <p style='font-size:14px'>Hi <span style=" font-weight:600">${
                              req.body.email
                            },</span></p>
                            <p style='font-size:14px;'>Please copy the One Time Password (OTP) below and enter it in the verification page on the Swasti.</p>
                             <div class="horizontal-line"></div>
                             <p class="otp-container"> ${otp}</p>
                            <div class="horizontal-line"></div>
                            
                            <p style='font-size:14px;'>This code <span style="font-weight:600;" >expires in ${
                              parseInt(OTP_VALIDITY_IN_MILLISECONDS) / 1000 / 60
                            } minutes.</span>Please,  <span style="font-weight:600;" >DONOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                              <div class="horizontal-line"></div>
                        </div>
                    </body>
                    </html>`,
          userEmail: req.body.email,
          userName: req.body.name,
        };
        const response = await sendEmail(options);
        console.log(response);
        const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
        await EmailCredential.update(
          {
            emailSend: increaseNumber,
          },
          { where: { id: finaliseEmailCredential.id } }
        );
      }
      //  Store OTP
      await EmailOTP.create({
        vallidTill:
          new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
        otp: otp,
        receiverId: instructor.id,
      });
    }
    await ServiceNotification.create({
      instructorId: homeTutor.instructorId,
      notification: `Welcome ${name} !
      Thank you for registering with Swasti Bharat. 
      You are now part of our vibrant community. 
      Take a moment to set up your profile and start exploring our features. 
      We are excited to support you on your journey!`,
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `OTP send to email successfully! Valid for ${
        OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)
      } minutes!`,
      data: { email: req.body.email },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

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
        email: req.body.email,
      },
    });
    if (!isInstructor) {
      return res.status(400).send({
        success: false,
        message: "NOTPRESENT!", // Redirect to register page, where only name and mobile number field will open
        data: { email: req.body.email },
      });
    }
    // Generate OTP for Email
    const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
    // Update sendEmail 0 every day
    const date = JSON.stringify(new Date());
    const todayDate = `${date.slice(1, 11)}`;
    const changeUpdateDate = await EmailCredential.findAll({
      where: {
        updatedAt: { [Op.lt]: todayDate },
      },
      order: [["createdAt", "ASC"]],
    });
    for (let i = 0; i < changeUpdateDate.length; i++) {
      // console.log("hii");
      await EmailCredential.update(
        {
          emailSend: 0,
        },
        {
          where: {
            id: changeUpdateDate[i].id,
          },
        }
      );
    }
    // finalise email credentiel
    const emailCredential = await EmailCredential.findAll({
      order: [["createdAt", "ASC"]],
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
                            <p style='font-size:14px'>Hi <span style=" font-weight:600">${
                              req.body.email
                            },</span></p>
                            <p style='font-size:14px;'>Please copy the One Time Password (OTP) below and enter it in the verification page on the  Swasti.</p>
                             <div class="horizontal-line"></div>
                             <p class="otp-container"> ${otp}</p>
                            <div class="horizontal-line"></div>
                            
                            <p style='font-size:14px;'>This code <span style="font-weight:600;" >expires in ${
                              parseInt(OTP_VALIDITY_IN_MILLISECONDS) / 1000 / 60
                            } minutes.</span>Please,  <span style="font-weight:600;" >DONOT SHARE OR SEND THIS CODE TO ANYONE!</span></p>
                              <div class="horizontal-line"></div>
                        </div>
                    </body>
                    </html>`,
          userEmail: req.body.email,
          userName: isInstructor.name,
        };
        const response = await sendEmail(options);
        console.log(response);
        const increaseNumber = parseInt(finaliseEmailCredential.emailSend) + 1;
        await EmailCredential.update(
          {
            emailSend: increaseNumber,
          },
          { where: { id: finaliseEmailCredential.id } }
        );
      }
      //  Store OTP
      await EmailOTP.create({
        vallidTill:
          new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
        otp: otp,
        receiverId: isInstructor.id,
      });
    }
    // Send final success response
    res.status(200).send({
      success: true,
      message: `OTP send to email successfully! Valid for ${
        OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)
      } minutes!`,
      data: { email: req.body.email },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
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
        otp: otp,
      },
    });
    if (!isOtp) {
      return res.status(400).send({
        success: false,
        message: `Invalid OTP!`,
      });
    }
    // Checking is user present or not
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [{ email: email }, { id: isOtp.receiverId }],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "No Details Found. Register Now!",
      });
    }
    // is email otp expired?
    const isOtpExpired = new Date().getTime() > parseInt(isOtp.vallidTill);
    if (isOtpExpired) {
      await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
      return res.status(400).send({
        success: false,
        message: `OTP expired!`,
      });
    }
    await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
    // Chakra
    if (!instructor.isOTPVerify) {
      await instructor.update({ ...instructor, isOTPVerify: true });
      if (instructor.referralCode) {
        const referral = await Instructor.findOne({
          where: {
            instructorCode: instructor.referralCode,
          },
        });
        if (referral) {
          const chakraBreakNumber = parseInt(referral.chakraBreakNumber);
          const chakras = await Chakra.findAll({
            where: {
              ownerId: referral.id,
            },
            order: [["chakraNumber", "ASC"]],
          });
          let totalChakraQuantity = 0;
          for (let i = 0; i < chakras.length; i++) {
            totalChakraQuantity =
              totalChakraQuantity + parseInt(chakras[i].quantity);
          }
          let specialNum;
          if (totalChakraQuantity <= 20) {
            specialNum = getRandomIntInclusive(7, chakraBreakNumber);
          } else {
            specialNum = getRandomInt(7);
          }
          const specialChakra = await Chakra.findOne({
            where: { ownerId: referral.id, chakraNumber: parseInt(specialNum) },
          });
          const newQuantity = parseInt(specialChakra.quantity) + 1;
          await specialChakra.update({
            ...specialChakra,
            quantity: newQuantity,
          });
          const date = getTodayTime();
          await ReferralHistory.create({
            chakraNumber: specialNum,
            joinerName: instructor.name,
            date: date,
            joinerId: instructor.id,
            ownerId: referral.id,
          });
        }
      }
    }
    // generate JWT Token
    const authToken = jwt.sign(
      {
        id: instructor.id,
        email: email,
        phoneNumber: instructor.phoneNumber,
      },
      INSTRUCTOR_JWT_SECRET_KEY,
      { expiresIn: JWT_VALIDITY } // five day
    );
    res.status(201).send({
      success: true,
      message: `Verified successfully!`,
      authToken: authToken,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.getInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
      include: [
        {
          model: InstructorQualification,
          as: "qualifications",
        },
        {
          model: InstructorExperience,
          as: "experience",
        },
      ],
    });
    let profileComplete = 0;
    if (instructor.name) {
      profileComplete = profileComplete + 7;
    }
    if (instructor.imageFileName) {
      profileComplete = profileComplete + 2;
    }
    if (instructor.languages) {
      profileComplete = profileComplete + 2;
    }
    if (instructor.bio) {
      profileComplete = profileComplete + 2;
    }
    if (instructor.location) {
      profileComplete = profileComplete + 2;
    }
    if (instructor.dateOfBirth) {
      profileComplete = profileComplete + 2;
    }
    if (instructor.email && instructor.phoneNumber) {
      profileComplete = profileComplete + 13;
    }
    const kyc = await IKYC.findOne({
      where: { instructorId: req.instructor.id, isVerify: true },
    });
    if (kyc) profileComplete = profileComplete + 20;
    const qualification = await InstructorQualification.findOne({
      where: {
        instructorId: req.instructor.id,
        // approvalStatusByAdmin: "Approved",
      },
    });
    if (qualification) profileComplete = profileComplete + 30;
    const bank = await IBankDetail.findOne({
      where: { instructorId: req.instructor.id, isVerify: true },
    });
    if (bank) profileComplete = profileComplete + 20;
    // Send final success response
    res.status(200).send({
      success: true,
      message: "Instructor Profile Fetched successfully!",
      data: { instructor: instructor, profileComplete: profileComplete },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

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
          { instructorCode: { [Op.substring]: search } },
        ],
      });
    }
    const count = await Instructor.count({
      where: {
        [Op.and]: condition,
      },
    });
    const instructor = await Instructor.findAll({
      limit: limit,
      offset: offSet,
      where: {
        [Op.and]: condition,
      },
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: "Instructor Profile Fetched successfully!",
      totalPage: Math.ceil(count / limit),
      currentPage: currentPage,
      data: instructor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getInstructorForAdmin = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: InstructorQualification,
          as: "qualifications",
        },
        {
          model: InstructorExperience,
          as: "experience",
        },
      ],
      paranoid: false,
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    // Send final success response
    res.status(200).send({
      success: true,
      message: "Instructor Profile Fetched successfully!",
      data: instructor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.registerInstructor = async (req, res) => {
  try {
    // Validate Body
    const { error } = registerInstructor(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { referralCode } = req.body;
    // Check is present
    const isInstructor = await Instructor.findOne({
      paranoid: false,
      where: {
        email: req.body.email,
      },
    });
    if (isInstructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is already present!",
      });
    }
    // generate employee code
    let code;
    const isInstructorCode = await Instructor.findAll({
      paranoid: false,
      order: [["createdAt", "ASC"]],
    });
    if (isInstructorCode.length == 0) {
      code = "INST" + 1000;
    } else {
      let lastInstructorCode = isInstructorCode[isInstructorCode.length - 1];
      let lastDigits = lastInstructorCode.instructorCode.substring(4);
      let incrementedDigits = parseInt(lastDigits, 10) + 1;
      code = "INST" + incrementedDigits;
    }
    const num = getRandomInt(7);
    // Create instructor in database
    const instructor = await Instructor.create({
      ...req.body,
      instructorCode: code,
      createdBy: "Admin",
      referralCode: referralCode,
      chakraBreakNumber: num + 1,
    });
    // Creating Wallet
    await InstructorWallet.create({
      instructorId: instructor.id,
    });
    // Create Chakra
    const chakraName = [
      "Root",
      "Sacral",
      "Solar Plexus",
      "Heart",
      "Throat",
      "Third Eye",
      "Crown",
    ];
    for (let i = 0; i < chakraName.length; i++) {
      await Chakra.create({
        chakraName: chakraName[i],
        chakraNumber: i + 1,
        quantity: 0,
        ownerId: instructor.id,
      });
    }
    // Email or SMS to Insturctor
    // Send final success response
    res.status(200).send({
      success: true,
      message: "Instructor Registered successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.softDeleteInstructor = async (req, res) => {
  try {
    // Check perticular instructor present in database
    const instructor = await Instructor.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    // soft delete
    await instructor.destroy();
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Instructor Profile [${instructor.instructorCode}] soft deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.restoreInstructor = async (req, res) => {
  try {
    // Check perticular instructor present in database
    const instructor = await Instructor.findOne({
      paranoid: false,
      where: {
        id: req.params.id,
        deletedAt: { [Op.ne]: null },
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present in soft delete!",
      });
    }
    // restore
    await instructor.restore();
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Instructor Profile [${instructor.instructorCode}] restored successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

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
    const condition = [
      {
        deletedAt: { [Op.ne]: null },
      },
    ];
    if (search) {
      condition.push({
        [Op.or]: [
          { name: { [Op.substring]: search } },
          { eamil: { [Op.substring]: search } },
          { instructorCode: { [Op.substring]: search } },
        ],
      });
    }
    const count = await Instructor.count({
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
    });
    const instructor = await Instructor.findAll({
      limit: limit,
      offset: offSet,
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: "Deleted Instructor's Profile Fetched successfully!",
      totalPage: Math.ceil(count / limit),
      currentPage: currentPage,
      data: instructor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

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
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    const {
      bio,
      socialMediaLink,
      location,
      twitter_x,
      facebook,
      instagram,
      linkedIn,
      languages,
      dateOfBirth,
      latitude,
      longitude,
    } = req.body;
    const name = capitalizeFirstLetter(req.body.name);
    // store current data in history
    await InstructorHistory.create({
      name: instructor.name,
      email: instructor.email,
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
      dateOfBirth: instructor.dateOfBirth,
      longitude: instructor.longitude,
      latitude: instructor.latitude,
    });
    let image_Path = instructor.imagePath,
      imageFileName = instructor.imageFileName,
      imageOriginalName = instructor.imageOriginalName;
    if (req.file) {
      //Upload file
      const fileStream = fs.createReadStream(req.file.path);
      await uploadFileToBunny(bunnyFolderName, fileStream, req.file.filename);
      image_Path = `${SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.file.filename}`;
      imageFileName = req.file.filename;
      imageOriginalName = req.file.originalname;
      // delete file from resource/servere
      deleteSingleFile(req.file.path);
    }
    // Update
    await instructor.update({
      name: name,
      bio: bio,
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
      dateOfBirth: dateOfBirth,
      latitude: latitude,
      longitude: longitude,
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Instructor Profile updated successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.registerByNumber = async (req, res) => {
  try {
    // Validate Body
    const { error } = registerInstructor(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { referralCode } = req.body;
    // Check is present
    const isInstructor = await Instructor.findOne({
      paranoid: false,
      where: {
        [Op.or]: [
          { email: req.body.email },
          { phoneNumber: req.body.phoneNumber },
        ],
      },
    });
    if (isInstructor) {
      return res.status(400).send({
        success: false,
        message: "This credentials already exist!!", // Redirect to login by phone number page
      });
    }
    // generate employee code
    let code;
    const isInstructorCode = await Instructor.findAll({
      paranoid: false,
      order: [["createdAt", "ASC"]],
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
    const num = getRandomInt(7);
    // Create instructor in database
    const instructor = await Instructor.create({
      email: req.body.email,
      name: name,
      phoneNumber: req.body.phoneNumber,
      instructorCode: code,
      referralCode: referralCode,
      chakraBreakNumber: num + 1,
    });
    // Creating Wallet
    await InstructorWallet.create({
      instructorId: instructor.id,
    });
    // Create Chakra
    const chakraName = [
      "Root",
      "Sacral",
      "Solar Plexus",
      "Heart",
      "Throat",
      "Third Eye",
      "Crown",
    ];
    for (let i = 0; i < chakraName.length; i++) {
      await Chakra.create({
        chakraName: chakraName[i],
        chakraNumber: i + 1,
        quantity: 0,
        ownerId: instructor.id,
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
      receiverId: instructor.id,
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Registerd successfully!`,
      data: { phoneNumber: req.body.phoneNumber },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

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
        phoneNumber: req.body.phoneNumber,
      },
    });
    if (!isInstructor) {
      return res.status(400).send({
        success: false,
        message: "NOTPRESENT!", // Redirect to register page, where only name and email field will open
        data: { phoneNumber: req.body.phoneNumber },
      });
    }
    // Generate OTP for Email
    const otp = generateOTP.generateFixedLengthRandomNumber(OTP_DIGITS_LENGTH);
    // Sending OTP to mobile number
    const response =await sendOTPToNumber(req.body.phoneNumber, otp);
    console.log(response);
    //  Store OTP
    await EmailOTP.create({
      vallidTill: new Date().getTime() + parseInt(OTP_VALIDITY_IN_MILLISECONDS),
      otp: otp,
      receiverId: isInstructor.id,
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `OTP send successfully! Valid for ${
        OTP_VALIDITY_IN_MILLISECONDS / (60 * 1000)
      } minutes!`,
      data: { phoneNumber: req.body.phoneNumber },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

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
        otp: otp,
      },
    });
    if (!isOtp) {
      return res.status(400).send({
        success: false,
        message: `Invalid OTP!`,
      });
    }
    // Checking is user present or not
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [{ phoneNumber: phoneNumber }, { id: isOtp.receiverId }],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "No Details Found. Register Now!",
      });
    }
    // is email otp expired?
    const isOtpExpired = new Date().getTime() > parseInt(isOtp.vallidTill);
    if (isOtpExpired) {
      await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
      return res.status(400).send({
        success: false,
        message: `OTP expired!`,
      });
    }
    await EmailOTP.destroy({ where: { receiverId: isOtp.receiverId } });
    // Chakra
    if (!instructor.isOTPVerify) {
      await instructor.update({ ...instructor, isOTPVerify: true });
      if (instructor.referralCode) {
        const referral = await Instructor.findOne({
          where: {
            instructorCode: instructor.referralCode,
          },
        });
        if (referral) {
          const chakraBreakNumber = parseInt(referral.chakraBreakNumber);
          const chakras = await Chakra.findAll({
            where: {
              ownerId: referral.id,
            },
            order: [["chakraNumber", "ASC"]],
          });
          let totalChakraQuantity = 0;
          for (let i = 0; i < chakras.length; i++) {
            totalChakraQuantity =
              totalChakraQuantity + parseInt(chakras[i].quantity);
          }
          let specialNum;
          if (totalChakraQuantity <= 20) {
            specialNum = getRandomIntInclusive(7, chakraBreakNumber);
          } else {
            specialNum = getRandomInt(7);
          }
          const specialChakra = await Chakra.findOne({
            where: { ownerId: referral.id, chakraNumber: parseInt(specialNum) },
          });
          const newQuantity = parseInt(specialChakra.quantity) + 1;
          await specialChakra.update({
            ...specialChakra,
            quantity: newQuantity,
          });
          const date = getTodayTime();
          await ReferralHistory.create({
            chakraNumber: specialNum,
            joinerName: instructor.name,
            date: date,
            joinerId: instructor.id,
            ownerId: referral.id,
          });
        }
      }
    }
    // generate JWT Token
    const authToken = jwt.sign(
      {
        id: instructor.id,
        email: instructor.email,
        phoneNumber: phoneNumber,
      },
      INSTRUCTOR_JWT_SECRET_KEY,
      { expiresIn: JWT_VALIDITY } // five day
    );
    res.status(201).send({
      success: true,
      message: `Verified successfully!`,
      authToken: authToken,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.instructorTerm = async (req, res) => {
  try {
    // Validate body
    const { error } = instructorTerm(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { instructorTermAccepted } = req.body;
    // Check perticular instructor present in database
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    // Update
    await instructor.update({
      ...instructor,
      instructorTermAccepted: instructorTermAccepted,
      // isInstructor: isInstructor
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Instructor term accepted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.homeTutorTerm = async (req, res) => {
  try {
    // Validate body
    const { error } = homeTutorTerm(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { homeTutorTermAccepted } = req.body;
    // Check perticular instructor present in database
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    // Update
    await instructor.update({
      ...instructor,
      homeTutorTermAccepted: homeTutorTermAccepted,
      // isHomeTutor: isHomeTutor
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Home tutor term accepted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.therapistTerm = async (req, res) => {
  try {
    // Validate body
    const { error } = therapistTerm(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { therapistTermAccepted } = req.body;
    // Check perticular instructor present in database
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    // Update
    await instructor.update({
      ...instructor,
      therapistTermAccepted: therapistTermAccepted,
      // isTherapist: isTherapist
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Therapist term accepted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.yogaStudioTerm = async (req, res) => {
  try {
    // Validate body
    const { error } = yogaStudioTerm(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { yogaStudioTermAccepted } = req.body;
    // Check perticular instructor present in database
    const instructor = await Instructor.findOne({
      where: {
        [Op.and]: [
          { id: req.instructor.id },
          { email: req.instructor.email },
          { phoneNumber: req.instructor.phoneNumber },
        ],
      },
    });
    if (!instructor) {
      return res.status(400).send({
        success: false,
        message: "Instructor is not present!",
      });
    }
    // Update
    await instructor.update({
      ...instructor,
      yogaStudioTermAccepted: yogaStudioTermAccepted,
      // ownYogaStudio: ownYogaStudio
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Yoga studio term accepted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getMyChakra = async (req, res) => {
  try {
    const chakra = await Chakra.findAll({
      where: {
        [Op.and]: [{ ownerId: req.instructor.id }],
      },
      order: [["chakraNumber", "ASC"]],
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Chakra fetched successfully!`,
      data: chakra,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getReferralData = async (req, res) => {
  try {
    const referral = await ReferralHistory.findAll({
      where: {
        ownerId: req.instructor.id,
      },
      order: [["createdAt", "DESC"]],
    });
    // Send final success response
    res.status(200).send({
      success: true,
      message: `Referral data fetched successfully!`,
      data: referral,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
