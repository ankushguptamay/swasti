const db = require("../../Models");
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile");
const YogaStudioBusiness = db.yogaStudioBusiness;
const YogaStudioContact = db.yogaStudioContact;
const YogaStudioTime = db.yogaStudioTiming;
const YogaStudioImage = db.yogaStudioImage;
const YSBusinessHistory = db.ySBusinessHistory;
const YSContactHistory = db.ySContactHistory;
const YSTimeHistory = db.ySTimingHistory;

const { deleteFileToBunny } = require("../../Util/bunny");
const bunnyFolderName = "ys-doc";

exports.softDeleteYogaStudioBusiness = async (req, res) => {
  try {
    let deletedThrough = "Admin";
    let condition = {
      id: req.params.id,
    };
    if (req.instructor) {
      condition = {
        id: req.params.id,
        instructorId: req.instructor.id,
      };
      deletedThrough = "Instructor";
    }
    // Find business In Database
    const business = await YogaStudioBusiness.findOne({
      where: condition,
    });
    if (!business) {
      return res.status(400).send({
        success: false,
        message: "This studio is not present!",
      });
    }
    // update business
    await business.update({
      ...business,
      deletedThrough: deletedThrough,
    });
    // soft delete business
    await business.destroy();
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio business deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.hardDeleteYogaStudioBusiness = async (req, res) => {
  try {
    let condition = {
      id: req.params.id,
    };
    // Find business In Database
    const business = await YogaStudioBusiness.findOne({
      where: condition,
      paranoid: false,
    });
    if (!business) {
      return res.status(400).send({
        success: false,
        message: "This studio is not present!",
      });
    }
    // hard delete Contact
    await YogaStudioContact.destroy({
      where: { businessId: req.params.id },
      force: true,
    });
    // hard delete Times
    await YogaStudioTime.destroy({
      where: { businessId: req.params.id },
      force: true,
    });
    // hard delete business history
    await YSBusinessHistory.destroy({ where: { businessId: req.params.id } });
    // hard delete business images
    const images = await YogaStudioImage.findAll({
      where: { businessId: req.params.id },
      force: true,
    });
    for (let i = 0; i < images.length; i++) {
      if (images[i].fileName) {
        await deleteFileToBunny(bunnyFolderName, images[i].fileName);
      }
    }
    await YogaStudioImage.destroy({
      where: { businessId: req.params.id },
      force: true,
    });
    // hard delete business
    await business.destroy({ force: true });
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio business hard deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.softDeleteYogaStudioImage = async (req, res) => {
  try {
    let deletedThrough = "Admin";
    let condition = {
      id: req.params.id,
    };
    if (req.instructor) {
      condition = {
        id: req.params.id,
        instructorId: req.instructor.id,
      };
      deletedThrough = "Instructor";
    }
    // Find image In Database
    const image = await YogaStudioImage.findOne({
      where: condition,
    });
    if (!image) {
      return res.status(400).send({
        success: false,
        message: "This studio image is not present!",
      });
    }
    // update image
    await image.update({
      ...image,
      deletedThrough: deletedThrough,
    });
    // soft delete image
    await image.destroy();
    // Any updation
    const anyContatct = await YogaStudioContact.findOne({
      where: {
        businessId: image.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyImage = await YogaStudioImage.findOne({
      where: {
        businessId: image.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyTime = await YogaStudioTime.findOne({
      where: {
        businessId: image.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyBusinessHistory = await YSBusinessHistory.findOne({
      where: { businessId: image.businessId, updationStatus: "Pending" },
    });
    if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: true,
        },
        { where: { id: image.businessId } }
      );
    } else {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: false,
        },
        { where: { id: image.businessId } }
      );
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio image deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.hardDeleteYogaStudioImage = async (req, res) => {
  try {
    let condition = {
      id: req.params.id,
    };
    // Find image In Database
    const image = await YogaStudioImage.findOne({
      where: condition,
      paranoid: false,
    });
    if (!image) {
      return res.status(400).send({
        success: false,
        message: "This studio image is not present!",
      });
    }
    if (image.fileName) {
      await deleteFileToBunny(bunnyFolderName, image.fileName);
    }
    // destroy image
    await image.destroy({ force: true });
    // Any updation
    const anyContatct = await YogaStudioContact.findOne({
      where: {
        businessId: image.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyImage = await YogaStudioImage.findOne({
      where: {
        businessId: image.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyTime = await YogaStudioTime.findOne({
      where: {
        businessId: image.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyBusinessHistory = await YSBusinessHistory.findOne({
      where: { businessId: image.businessId, updationStatus: "Pending" },
    });
    if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: true,
        },
        { where: { id: image.businessId } }
      );
    } else {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: false,
        },
        { where: { id: image.businessId } }
      );
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio image hard deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.softDeleteYogaStudioContact = async (req, res) => {
  try {
    let deletedThrough = "Admin";
    let condition = {
      id: req.params.id,
    };
    if (req.instructor) {
      condition = {
        id: req.params.id,
        instructorId: req.instructor.id,
      };
      deletedThrough = "Instructor";
    }
    // Find contact In Database
    const contact = await YogaStudioContact.findOne({
      where: condition,
    });
    if (!contact) {
      return res.status(400).send({
        success: false,
        message: "This studio is not present!",
      });
    }
    // update contact
    await contact.update({
      ...contact,
      deletedThrough: deletedThrough,
    });
    // Any updation
    const anyContatct = await YogaStudioContact.findOne({
      where: {
        businessId: contact.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyImage = await YogaStudioImage.findOne({
      where: {
        businessId: contact.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyTime = await YogaStudioTime.findOne({
      where: {
        businessId: contact.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyBusinessHistory = await YSBusinessHistory.findOne({
      where: { businessId: contact.businessId, updationStatus: "Pending" },
    });
    if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: true,
        },
        { where: { id: contact.businessId } }
      );
    } else {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: false,
        },
        { where: { id: contact.businessId } }
      );
    }
    // Soft contact
    await contact.destroy();
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio contact deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.hardDeleteYogaStudioContact = async (req, res) => {
  try {
    let condition = {
      id: req.params.id,
    };
    // Find contact In Database
    const contact = await YogaStudioContact.findOne({
      where: condition,
      paranoid: false,
    });
    if (!contact) {
      return res.status(400).send({
        success: false,
        message: "This studio is not present!",
      });
    }
    await YSContactHistory.destroy({ where: { ySContactId: req.params.id } });
    // hard delete business
    await contact.destroy({ force: true });
    // Any updation
    const anyContatct = await YogaStudioContact.findOne({
      where: {
        businessId: contact.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyImage = await YogaStudioImage.findOne({
      where: {
        businessId: contact.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyTime = await YogaStudioTime.findOne({
      where: {
        businessId: contact.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyBusinessHistory = await YSBusinessHistory.findOne({
      where: { businessId: contact.businessId, updationStatus: "Pending" },
    });
    if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: true,
        },
        { where: { id: contact.businessId } }
      );
    } else {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: false,
        },
        { where: { id: contact.businessId } }
      );
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio contact hard deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.softDeleteYogaStudioTime = async (req, res) => {
  try {
    let deletedThrough = "Admin";
    let condition = {
      id: req.params.id,
    };
    if (req.instructor) {
      condition = {
        id: req.params.id,
        instructorId: req.instructor.id,
      };
      deletedThrough = "Instructor";
    }
    // Find time In Database
    const time = await YogaStudioTime.findOne({
      where: condition,
    });
    if (!time) {
      return res.status(400).send({
        success: false,
        message: "This studio time is not present!",
      });
    }
    // update time
    await time.update({
      ...time,
      deletedThrough: deletedThrough,
    });
    // soft delete time
    await time.destroy();
    // Any updation
    const anyContatct = await YogaStudioContact.findOne({
      where: {
        businessId: time.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyImage = await YogaStudioImage.findOne({
      where: {
        businessId: time.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyTime = await YogaStudioTime.findOne({
      where: {
        businessId: time.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyBusinessHistory = await YSBusinessHistory.findOne({
      where: { businessId: time.businessId, updationStatus: "Pending" },
    });
    if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: true,
        },
        { where: { id: time.businessId } }
      );
    } else {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: false,
        },
        { where: { id: time.businessId } }
      );
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: `Yoga studio time deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.hardDeleteYogaStudioTime = async (req, res) => {
  try {
    let condition = {
      id: req.params.id,
    };
    // Find time In Database
    const time = await YogaStudioTime.findOne({
      where: condition,
      paranoid: false,
    });
    if (!time) {
      return res.status(400).send({
        success: false,
        message: "This studio time is not present!",
      });
    }
    await YSTimeHistory.destroy({ where: { ySTimeId: time.id } });
    // hard delete business
    await time.destroy({ force: true });
    // Final Response
    // Any updation
    const anyContatct = await YogaStudioContact.findOne({
      where: {
        businessId: time.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyImage = await YogaStudioImage.findOne({
      where: {
        businessId: time.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyTime = await YogaStudioTime.findOne({
      where: {
        businessId: time.businessId,
        anyUpdateRequest: true,
        deletedThrough: null,
      },
    });
    const anyBusinessHistory = await YSBusinessHistory.findOne({
      where: { businessId: time.businessId, updationStatus: "Pending" },
    });
    if (anyContatct || anyImage || anyTime || anyBusinessHistory) {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: true,
        },
        { where: { id: time.businessId } }
      );
    } else {
      // Update business
      await YogaStudioBusiness.update(
        {
          anyUpdateRequest: false,
        },
        { where: { id: time.businessId } }
      );
    }
    res.status(200).send({
      success: true,
      message: `Yoga studio time hard deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
