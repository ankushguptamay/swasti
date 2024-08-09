const db = require("../../Models");
const { Op } = require("sequelize");
const {
  homeTutorValidation,
  hTutorLocationValidation,
} = require("../../Middleware/Validate/validateHomeTutor");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;

exports.updateHomeTutor = async (req, res) => {
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
    // Find in database
    const homeTutor = await HomeTutor.findOne({
      where: {
        id: req.params.id,
        instructorId: req.instructor.id,
      },
    });
    if (!homeTutor) {
      return res.status(400).send({
        success: false,
        message: "This home tutor is not present!",
      });
    }
    if (
      homeTutor.approvalStatusByAdmin === null ||
      homeTutor.approvalStatusByAdmin === "Pending"
    ) {
      await homeTutor.update({
        ...homeTutor,
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
      });
    } else {
      // Delete any updation request if present
      await HomeTutorHistory.destroy({
        where: {
          homeTutorId: homeTutor.id,
          updationStatus: "Pending",
        },
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
        updationStatus: "Pending",
        updatedBy: "Instructor",
      });
      await homeTutor.update({
        ...homeTutor,
        anyUpdateRequest: true,
      });
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home Tutor updated successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.updateHTServiceArea = async (req, res) => {
  try {
    // Validate Body
    const { error } = hTutorLocationValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { locationName, latitude, longitude, radius, unit } = req.body;
    // Find Home Tutor service area In Database
    const area = await HTServiceArea.findOne({
      where: { id: req.params.id },
    });
    if (!area) {
      return res.status(400).send({
        success: false,
        message: "Home tutor area is not present!",
      });
    }
    await area.update({ deletedThrough: "ByUpdation" });
    // Create New One
    await HTServiceArea.create({
      locationName: locationName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius,
      unit: unit,
      homeTutorId: area.homeTutorId,
    });
    // Soft Delete Previous
    await area.destroy();
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor area updated successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
