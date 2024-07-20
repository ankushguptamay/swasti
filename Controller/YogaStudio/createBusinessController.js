const db = require("../../Models");
const { Op } = require("sequelize");
const {
  createBusiness,
  createContact,
  createTiming,
} = require("../../Middleware/Validate/validateYogaStudio");
const { deleteSingleFile } = require("../../Util/deleteFile");
const {
  changeQualificationStatus,
} = require("../../Middleware/Validate/validateInstructor");
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;
const YogaStudioImage = db.yogaStudioImage;
const YSBusinessHistory = db.ySBusinessHistory;
const YSContactHistory = db.ySContactHistory;
const YSTimeHistory = db.ySTimingHistory;
const { uploadFileToBunny} = require("../../Util/bunny");
const { SHOW_BUNNY_FILE_HOSTNAME } = process.env;
const fs = require("fs");
const bunnyFolderName = "ys-doc";

exports.createYogaStudioBusiness = async (req, res) => {
  try {
    // Validate Body
    const { error } = createBusiness(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const {
      block_building,
      street_colony,
      pincode,
      area,
      landmark,
      city,
      state,
      latitude,
      longitude,
    } = req.body;
    const businessName = capitalizeFirstLetter(req.body.businessName);
    const business = await YogaStudioBusiness.create({
      latitude: latitude,
      longitude: longitude,
      businessName: businessName,
      block_building: block_building,
      street_colony: street_colony,
      pincode: pincode,
      state: state,
      city: city,
      landmark: landmark,
      area: area,
      instructorId: req.instructor.id,
      approvalStatusByAdmin: null,
    });

    await YSBusinessHistory.create({
      latitude: latitude,
      longitude: longitude,
      businessName: businessName,
      block_building: block_building,
      street_colony: street_colony,
      pincode: pincode,
      state: state,
      city: city,
      landmark: landmark,
      area: area,
      updationStatus: null,
      businessId: business.id,
      updatedBy: "Instructor",
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Submit successfully!",
      data: {
        id: business.id,
      },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.createYogaStudioImage = async (req, res) => {
  try {
    // File should be exist
    if (!req.files) {
      return res.status(400).send({
        success: false,
        message: "Please..Upload image!",
      });
    }

    const files = req.files;
    for (let i = 0; i < files.length; i++) {
      //Upload file
      const fileStream = fs.createReadStream(files[i].path);
      await uploadFileToBunny(bunnyFolderName, fileStream, files[i].filename);
      // delete file from resource/servere
      deleteSingleFile(files[i].path);
      await YogaStudioImage.create({
        originalName: files[i].originalname,
        path: `${SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${files[i].filename}`,
        fileName: files[i].filename,
        instructorId: req.instructor.id,
        businessId: req.params.id,
        approvalStatusByAdmin: null,
      });
    }
    // update YogaStudioBusiness anyUpdateRequest
    await YogaStudioBusiness.update(
      { anyUpdateRequest: true },
      { where: { id: req.params.id } }
    );

    // Final Response
    res.status(200).send({
      success: true,
      message: "Submit successfully!",
      data: {
        id: req.params.id,
      },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.createYogaStudioContact = async (req, res) => {
  try {
    // Validate Body
    const { error } = createContact(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { mobileNumber, whatsAppNumber, email, landLineNumber } = req.body;
    const title = capitalizeFirstLetter(req.body.title);
    const person = capitalizeFirstLetter(req.body.person);

    const contact = await YogaStudioContact.create({
      title: title,
      person: person,
      mobileNumber: mobileNumber,
      whatsAppNumber: whatsAppNumber,
      landLineNumber: landLineNumber,
      email: email,
      instructorId: req.instructor.id,
      businessId: req.params.id,
      approvalStatusByAdmin: null,
    });
    await YSContactHistory.create({
      title: title,
      person: person,
      mobileNumber: mobileNumber,
      whatsAppNumber: whatsAppNumber,
      landLineNumber: landLineNumber,
      email: email,
      updationStatus: null,
      ySContactId: contact.id,
      updatedBy: "Instructor",
    });
    // update YogaStudioBusiness anyUpdateRequest
    await YogaStudioBusiness.update(
      { anyUpdateRequest: true },
      { where: { id: req.params.id } }
    );

    // Final Response
    res.status(200).send({
      success: true,
      message: "Submit successfully!",
      data: {
        id: req.params.id,
      },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.createYogaStudioTiming = async (req, res) => {
  try {
    // const timings = [{
    //     openAt: 'bkhjl',
    //     closeAt: "vhohoho",
    //     isSat: true,
    //     isSun: true,
    //     isMon: false,
    //     isTue: true,
    //     isThu: false,
    //     isFri: true,
    //     isWed: false
    // }, {
    //     openAt: 'bkhjl',
    //     closeAt: "vhohoho",
    //     isSat: true,
    //     isSun: true,
    //     isMon: false,
    //     isTue: true,
    //     isThu: false,
    //     isFri: true,
    //     isWed: false
    // }]
    // Validate Body
    const { error } = createTiming(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { timings } = req.body;
    for (let i = 0; i < timings.length; i++) {
      const time = await YogaStudioTime.create({
        openAt: timings[i].openAt,
        closeAt: timings[i].closeAt,
        isFri: timings[i].isFri,
        isMon: timings[i].isMon,
        isSat: timings[i].isSat,
        isSun: timings[i].isSun,
        isThu: timings[i].isThu,
        isTue: timings[i].isTue,
        isWed: timings[i].isWed,
        instructorId: req.instructor.id,
        businessId: req.params.id,
        approvalStatusByAdmin: null,
      });
      await YSTimeHistory.create({
        openAt: timings[i].openAt,
        closeAt: timings[i].closeAt,
        isFri: timings[i].isFri,
        isMon: timings[i].isMon,
        isSat: timings[i].isSat,
        isSun: timings[i].isSun,
        isThu: timings[i].isThu,
        isTue: timings[i].isTue,
        isWed: timings[i].isWed,
        updationStatus: null,
        ySTimeId: time.id,
        updatedBy: "Instructor",
      });
    }
    // update YogaStudioBusiness anyUpdateRequest
    await YogaStudioBusiness.update(
      { anyUpdateRequest: true },
      { where: { id: req.params.id } }
    );
    // Final Response
    res.status(200).send({
      success: true,
      message: "Submit successfully!",
      data: {
        id: req.params.id,
      },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
