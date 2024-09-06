const db = require("../../Models");
const { Op } = require("sequelize");
const {
  homeTutorValidation,
  hTutorLocationValidation,
  hTutorTimeSloteValidation,
} = require("../../Middleware/Validate/validateHomeTutor");
const { deleteSingleFile } = require("../../Util/deleteFile");
const generateOTP = require("../../Util/generateOTP");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;

const { uploadFileToBunny } = require("../../Util/bunny");
const { SHOW_BUNNY_FILE_HOSTNAME } = process.env;
const fs = require("fs");
const bunnyFolderName = "ht-doc";

exports.createHomeTutor = async (req, res) => {
  try {
    // Validate Body
    const { error } = homeTutorValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const {
      isPrivateSO,
      isGroupSO,
      language,
      yogaFor,
      homeTutorName,
      privateSessionPrice_Day,
      privateSessionPrice_Month,
      groupSessionPrice_Day,
      groupSessionPrice_Month,
      specilization,
      instructorBio,
    } = req.body;
    // Validate price with there offer
    if (isGroupSO === true) {
      if (groupSessionPrice_Day && groupSessionPrice_Month) {
      } else {
        return res.status(400).send({
          success: false,
          message: "Please enter required group class price!",
        });
      }
    }
    if (isPrivateSO === true) {
      if (privateSessionPrice_Day && privateSessionPrice_Month) {
      } else {
        return res.status(400).send({
          success: false,
          message: "Please enter required individual class price!",
        });
      }
    }
    if (!isPrivateSO && !isGroupSO) {
      return res.status(400).send({
        success: false,
        message: "Please select atleast one service offered!",
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
      approvalStatusByAdmin: null,
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
      updatedBy: "Instructor",
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home Tutor created successfully!",
      data: { homeTutorId: homeTutor.id },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
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
        instructorId: req.instructor.id,
      },
    });
    if (!isHomeTutor) {
      return res.status(400).send({
        success: false,
        message: "This home tutor is not present!",
      });
    }
    // Store in database
    await HTServiceArea.create({
      locationName: locationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius,
      unit: unit,
      homeTutorId: homeTutorId,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Sevice area added successfully!",
      data: { homeTutorId: homeTutorId },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
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
    const {
      startTime,
      startDate,
      endDate,
      timeDurationInMin,
      serviceType,
      newServiceArea,
      noOfPeople,
    } = req.body;
    const homeTutorId = req.params.id;
    let serviceAreaId = req.body.serviceAreaId;

    if (serviceAreaId) {
      const isSAPresent = await HTServiceArea.findOne({
        where: { id: serviceAreaId, homeTutorId: homeTutorId },
      });
      if (!isSAPresent) {
        return res.status(400).send({
          success: false,
          message: "This service area is not present!",
        });
      }
    } else if (newServiceArea) {
      if (
        newServiceArea.locationName &&
        newServiceArea.latitude &&
        newServiceArea.longitude &&
        newServiceArea.radius &&
        newServiceArea.unit
      ) {
        const area = await HTServiceArea.create({
          locationName: newServiceArea.locationName,
          latitude: parseFloat(newServiceArea.latitude),
          longitude: parseFloat(newServiceArea.longitude),
          radius: newServiceArea.radius,
          unit: newServiceArea.unit,
          homeTutorId: homeTutorId,
        });
        serviceAreaId = area.dataValues.id;
      } else {
        return res.status(400).send({
          success: false,
          message: "Please send all required fields in service area!",
        });
      }
    } else {
      return res.status(400).send({
        success: false,
        message: "Please select a service area!",
      });
    }

    // Create array of dates
    function getDifferenceInDays(date1, date2) {
      const timeDiff = Math.abs(new Date(date2) - new Date(date1));
      const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return diffInDays;
    }
    const noOfDate = getDifferenceInDays(startDate, endDate) + 1;
    const date = [];
    for (i = 0; i < noOfDate; i++) {
      const today = new Date();
      today.setDate(today.getDate() + i);
      date.push(today.toISOString().slice(0, 10));
    }

    // Check is this home tutor present and created by same instructor
    const isHomeTutor = await HomeTutor.findOne({
      where: {
        id: homeTutorId,
        instructorId: req.instructor.id,
      },
    });
    if (!isHomeTutor) {
      return res.status(400).send({
        success: false,
        message: "This home tutor is not present!",
      });
    }
    //  Validate date
    const yesterday = new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000);
    for (let i = 0; i < date.length; i++) {
      const bookingDate = new Date(date[i]).getTime();
      if (bookingDate <= yesterday) {
        return res.status(400).send({
          success: false,
          message: `${date[i]} date is not acceptable!`,
        });
      }
    }
    // Store in database
    for (let j = 0; j < date.length; j++) {
      const today = `${date[j]}T18:30:00.000Z`;
      // Get All Today Code
      let code;
      const indtructorNumb = "INST1000"//req.instructorCode.substring(4);
      const isSloteCode = await HTTimeSlot.findAll({
        where: {
          createdAt: { [Op.gt]: today },
          sloteCode: { [Op.startsWith]: indtructorNumb },
        },
        order: [["createdAt", "ASC"]],
        paranoid: false,
      });
      const day = date[j].slice(8, 10);
      const year = date[j].slice(2, 4);
      const month = date[j].slice(5, 7);
      if (isSloteCode.length > 0) {
        code = isSloteCode[isSloteCode.length - 1].sloteCode;
      }

      const otp = generateOTP.generateFixedLengthRandomNumber(
        process.env.OTP_DIGITS_LENGTH
      );
      // Generating Code
      const isSlote = await HTTimeSlot.findOne({
        where: {
          time: startTime,
          date: date[j],
          homeTutorId: homeTutorId,
        },
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
        await HTTimeSlot.create({
          date: date[j],
          password: otp,
          timeDurationInMin: timeDurationInMin,
          sloteCode: code,
          serviceType: serviceType,
          noOfPeople: serviceType === "Private" ? 1 : noOfPeople,
          time: startTime,
          isBooked: false,
          serviceAreaId: serviceAreaId,
          appointmentStatus: "Active",
          homeTutorId: homeTutorId,
        });
      }
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: "Time slote added successfully!",
      data: { homeTutorId: homeTutorId },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.addHTutorImage = async (req, res) => {
  try {
    // File should be exist
    if (!req.files) {
      return res.status(400).send({
        success: false,
        message: "Please..Upload image!",
      });
    }
    const homeTutorId = req.params.id;
    const files = req.files;
    // Check is this home tutor present and created by same instructor
    const isHomeTutor = await HomeTutor.findOne({
      where: {
        id: homeTutorId,
        instructorId: req.instructor.id,
      },
    });
    if (!isHomeTutor) {
      // Delete File from server
      for (let i = 0; i < files.length; i++) {
        deleteSingleFile(files[i].path);
      }
      return res.status(400).send({
        success: false,
        message: "This home tutor is not present!",
      });
    }
    // console.log(files);
    // How mant file in already present
    const maxFileUpload = 3;
    const images = await HTutorImages.count({
      where: { homeTutorId: homeTutorId, deletedThrough: null },
    });
    const fileCanUpload = maxFileUpload - parseInt(images);
    for (let i = 0; i < files.length; i++) {
      if (i < fileCanUpload) {
        //Upload file
        const fileStream = fs.createReadStream(files[i].path);
        await uploadFileToBunny(bunnyFolderName, fileStream, files[i].filename);
        await HTutorImages.create({
          originalName: files[i].originalname,
          path: `${SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${files[i].filename}`,
          fileName: files[i].filename,
          homeTutorId: homeTutorId,
        });
      }
      deleteSingleFile(files[i].path);
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: `${fileCanUpload} home tutor images added successfully!`,
      data: { homeTutorId: homeTutorId },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
