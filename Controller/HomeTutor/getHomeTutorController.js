const db = require("../../Models");
const { Op } = require("sequelize");
const {
  getHomeTutorForUserValidation,
} = require("../../Middleware/Validate/validateHomeTutor");
const HomeTutor = db.homeTutor;
const HTServiceArea = db.hTServiceArea;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutorHistory = db.homeTutorHistory;
const HTutorImages = db.hTImage;
const ServiceNotification = db.serviceNotification;

exports.getMyHomeTutorForInstructor = async (req, res) => {
  try {
    const date = JSON.stringify(new Date());
    const todayDate = date.slice(1, 11);
    const homeTutor = await HomeTutor.findAll({
      where: {
        instructorId: req.instructor.id,
        deletedThrough: null,
      },
      include: [
        {
          model: HTServiceArea,
          as: "serviceAreas",
          where: {
            deletedThrough: null,
          },
          required: false,
        },
        {
          model: HTTimeSlot,
          as: "timeSlotes",
          where: {
            deletedThrough: null,
            date: todayDate,
          },
          attributes: { exclude: ["password"] },
          required: false,
        },
        {
          model: HTutorImages,
          as: "images",
          where: {
            deletedThrough: null,
          },
          required: false,
        },
      ],
    });
    // Auto submit for approval
    for (let i = 0; i < homeTutor.length; i++) {
      if (!homeTutor[i].approvalStatusByAdmin) {
        const language = homeTutor[i].language;
        const yogaFor = homeTutor[i].yogaFor;
        const images = homeTutor[i].images;
        const serviceAreas = homeTutor[i].serviceAreas;
        const specilization = homeTutor[i].specilization;
        if (
          specilization.length > 0 &&
          yogaFor.length > 0 &&
          language.length > 0 &&
          homeTutor[i].instructorBio
        ) {
          if (serviceAreas.length > 0 && images.length > 0) {
            // Submit for approval
            await homeTutor[i].update({
              ...homeTutor[i],
              approvalStatusByAdmin: "Pending",
            });
          }
        }
      }
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor fetched successfully!",
      data: homeTutor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHomeTutorForAdmin = async (req, res) => {
  try {
    const { page, limit, search, approvalStatusByAdmin } = req.query;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }
    const condition = [];
    if (approvalStatusByAdmin) {
      condition.push({ approvalStatusByAdmin: approvalStatusByAdmin });
    }
    // Search
    // if (search) {
    //     condition.push({
    //         [Op.or]: [
    //             {}
    //         ]
    //     })
    // }
    // Count All Home Tutor
    const totalTutor = await HomeTutor.count({
      where: {
        [Op.and]: condition,
      },
    });
    const homeTutor = await HomeTutor.findAll({
      limit: recordLimit,
      offset: offSet,
      where: {
        [Op.and]: condition,
      },
      order: [["createdAt", "DESC"]],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor fetched successfully!",
      totalPage: Math.ceil(totalTutor / recordLimit),
      currentPage: currentPage,
      data: homeTutor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHTServiceAreaByHTId = async (req, res) => {
  try {
    const hTServiceArea = await HTServiceArea.findAll({
      where: {
        homeTutorId: req.params.id,
        deletedThrough: null,
      },
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "HT service area fetched successfully!",
      data: hTServiceArea,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

// Admin and Instructor all not deleted
exports.getHomeTutorById = async (req, res) => {
  try {
    const date = JSON.stringify(new Date());
    const todayDate = date.slice(1, 11);
    const homeTutor = await HomeTutor.findOne({
      where: {
        id: req.params.id,
        deletedThrough: null,
      },
      include: [
        {
          model: HTServiceArea,
          as: "serviceAreas",
          where: {
            deletedThrough: null,
          },
          required: false,
        },
        {
          model: HTTimeSlot,
          as: "timeSlotes",
          where: {
            deletedThrough: null,
            date: todayDate,
          },
          attributes: { exclude: ["password"] },
          required: false,
        },
        {
          model: HTutorImages,
          as: "images",
          where: {
            deletedThrough: null,
          },
          required: false,
        },
      ],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor fetched successfully!",
      data: homeTutor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHTutorUpdationRequestById = async (req, res) => {
  try {
    const homeTutorHistory = await HomeTutorHistory.findAll({
      where: {
        homeTutorId: req.params.id,
        updationStatus: "Pending",
      },
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor updation request fetched successfully!",
      data: homeTutorHistory,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHomeTutorForUser = async (req, res) => {
  try {
    // Validate Body
    const { error } = getHomeTutorForUserValidation(req.query);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const {
      page,
      limit,
      search,
      price,
      isPersonal,
      isGroup,
      perDay,
      monthly,
      language,
      latitude,
      longitude,
      experience,
    } = req.query;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }
    const condition = [
      { approvalStatusByAdmin: "Approved" },
      { isPublish: true },
    ];
    // Search
    if (search) {
      condition.push({
        [Op.or]: [{ homeTutorName: { [Op.substring]: search } }],
      });
    }
    // Filter
    // if (language) {
    //     condition.push({ language: { [Op.contains]: language } });
    // }
    if (isPersonal) {
      condition.push({ isPrivateSO: isPersonal });
    }
    if (isGroup) {
      condition.push({ isGroupSO: isGroup });
    }
    if (price) {
      condition.push({
        [Op.or]: [
          { privateSessionPrice_Day: { [Op.lte]: parseFloat(price) } },
          { privateSessionPrice_Month: { [Op.lte]: parseFloat(price) } },
          { groupSessionPrice_Day: { [Op.lte]: parseFloat(price) } },
          { groupSessionPrice_Month: { [Op.lte]: parseFloat(price) } },
        ],
      });
    }
    // Location
    if (latitude && longitude) {
      const unit = "km"; // km for kilometer m for mile
      const distance = 20;
      const totalLocation = await HTServiceArea.scope({
        method: [
          "distance",
          parseFloat(latitude),
          parseFloat(longitude),
          distance,
          unit,
        ],
      }).findAll({
        attributes: [
          "id",
          "locationName",
          "latitude",
          "longitude",
          "homeTutorId",
        ],
        order: db.sequelize.col("distance"),
      });
      const tutorId = [];
      for (let i = 0; i < totalLocation.length; i++) {
        tutorId.push(totalLocation.homeTutorId);
      }
      condition.push({ id: tutorId });
    }
    // Count All Home Tutor
    const totalTutor = await HomeTutor.count({
      where: {
        [Op.and]: condition,
      },
    });
    const homeTutor = await HomeTutor.findAll({
      limit: recordLimit,
      offset: offSet,
      where: {
        [Op.and]: condition,
      },
      order: [["createdAt", "DESC"]],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor fetched successfully!",
      totalPage: Math.ceil(totalTutor / recordLimit),
      currentPage: currentPage,
      data: homeTutor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getNearestHomeTutorForUser = async (req, res) => {
  try {
    const { page, limit, latitude, longitude, distanceUnit, areaDistance } =
      req.query;
    if (!latitude && !longitude) {
      return res.status(400).send({
        success: false,
        message: "Location is required!",
      });
    }
    const unit = distanceUnit ? distanceUnit : "km"; // km for kilometer m for mile
    const distance = areaDistance ? areaDistance : 2;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }
    // Count All Areas
    const totalAreas = await HTServiceArea.scope({
      method: ["distance", latitude, longitude, distance, unit],
    }).findAll({
      attributes: ["id", "locationName", "latitude", "longitude"],
      order: db.sequelize.col("distance"),
    });
    // Find Areas
    const areas = await HTServiceArea.scope({
      method: ["distance", latitude, longitude, distance, unit],
    }).findAll({
      attributes: ["id", "locationName", "latitude", "longitude"],
      order: db.sequelize.col("distance"),
      limit: recordLimit,
      offset: offSet,
      include: [
        {
          model: HomeTutor,
          as: "homeTutors",
          where: { approvalStatusByAdmin: "Approved", isPublish: true },
        },
      ],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor fetched successfully!",
      totalPage: Math.ceil(totalAreas.length / recordLimit),
      currentPage: currentPage,
      data: areas,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHomeTutorByIdForUser = async (req, res) => {
  try {
    const date = JSON.stringify(new Date());
    const todayDate = date.slice(1, 11);
    const homeTutor = await HomeTutor.findOne({
      where: {
        id: req.params.id,
        deletedThrough: null,
        approvalStatusByAdmin: "Approved",
        isPublish: true,
      },
      include: [
        {
          model: HTServiceArea,
          as: "serviceAreas",
          where: {
            deletedThrough: null,
          },
          required: false,
        },
        {
          model: HTTimeSlot,
          as: "timeSlotes",
          where: {
            deletedThrough: null,
            date: todayDate,
          },
          required: false,
        },
        {
          model: HTutorImages,
          as: "images",
          where: {
            deletedThrough: null,
          },
          required: false,
        },
      ],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor fetched successfully!",
      data: homeTutor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHTTimeSloteForUser = async (req, res) => {
  try {
    const { date } = req.query;
    const yesterday = new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000);
    const today = JSON.stringify(new Date());
    if (date) {
      const bookingDate = new Date(date).getTime();
      if (bookingDate <= yesterday) {
        return res.status(400).send({
          success: false,
          message: `${date[i]} date is not acceptable!`,
        });
      } else {
        today = date;
      }
    } else {
      today = today.slice(1, 11);
    }
    const slote = await HTTimeSlot.findAll({
      where: {
        homeTutorId: req.params.id,
        deletedThrough: null,
        date: today,
      },
      include: [
        {
          model: HTServiceArea,
          as: "serviceArea",
          attributes: [
            "id",
            "locationName",
            "latitude",
            "radius",
            "unit",
            "longitude",
            "pincode",
          ],
        },
      ],
    });
    const homeTutor = await HomeTutor.findOne({ where: { id: req.params.id } });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor Time slote fetched successfully!",
      data: {
        slote: slote,
        homeTutor: homeTutor,
      },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getHTTimeSlote = async (req, res) => {
  try {
    const { date } = req.query;
    const slote = await HTTimeSlot.findAll({
      where: {
        homeTutorId: req.params.id,
        deletedThrough: null,
        date: date,
      },
      attributes: { exclude: ["password"] },
      include: {
        model: HTServiceArea,
        as: "serviceArea",
        attributes: [
          "id",
          "locationName",
          "latitude",
          "radius",
          "unit",
          "longitude",
          "pincode",
        ],
      },
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Home tutor Time slote fetched successfully!",
      data: slote,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllDeletedHT = async (req, res) => {
  try {
    const { page, limit, search, deletedThrough } = req.query;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }
    const condition = [{ deletedAt: { [Op.ne]: null } }];
    // Search
    if (search) {
      condition.push({
        [Op.or]: [{ approvalStatusByAdmin: search }],
      });
    }
    // Deleted Through
    if (deletedThrough) {
      condition.push({ deletedThrough: deletedThrough });
    }
    // Count All Home Tutor
    const totalTutor = await HomeTutor.count({
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
    });
    const homeTutor = await HomeTutor.findAll({
      limit: recordLimit,
      offset: offSet,
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
      order: [["createdAt", "DESC"]],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Deleted home tutor fetched successfully!",
      totalPage: Math.ceil(totalTutor / recordLimit),
      currentPage: currentPage,
      data: homeTutor,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getDeletedHTTimeSlotes = async (req, res) => {
  try {
    const { deletedThrough, date } = req.query;
    const condition = [
      {
        homeTutorId: req.params.id,
        deletedAt: { [Op.ne]: null },
      },
    ];
    if (deletedThrough) {
      condition.push({
        deletedThrough: deletedThrough,
      });
    }
    if (date) {
      condition.push({
        date: date,
      });
    }
    const timeSlote = await HTTimeSlot.findAll({
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Deleted home tutor time slotes fetched successfully!",
      data: timeSlote,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getDeletedHTImages = async (req, res) => {
  try {
    const { deletedThrough } = req.query;
    const condition = [
      {
        homeTutorId: req.params.id,
        deletedAt: { [Op.ne]: null },
      },
    ];
    if (deletedThrough) {
      condition.push({
        deletedThrough: deletedThrough,
      });
    }
    const images = await HTutorImages.findAll({
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Deleted home tutor images fetched successfully!",
      data: images,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getDeletedHTServiceArea = async (req, res) => {
  try {
    const { deletedThrough } = req.query;
    const condition = [
      {
        homeTutorId: req.params.id,
        deletedAt: { [Op.ne]: null },
      },
    ];
    if (deletedThrough) {
      condition.push({
        deletedThrough: deletedThrough,
      });
    }
    const area = await HTServiceArea.findAll({
      where: {
        [Op.and]: condition,
      },
      paranoid: false,
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "Deleted home tutor service areas fetched successfully!",
      data: area,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getServiceNotification = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }
    const condition = [{ instructorId: req.instructor.id }];
    // Search
    if (search) {
      condition.push({
        [Op.or]: [
          { notification: { [Op.substring]: search } },
          { instructorServices: { [Op.substring]: search } },
          { response: { [Op.substring]: search } },
        ],
      });
    }
    // Count All notification
    const totalNotification = await ServiceNotification.count({
      where: {
        [Op.and]: condition,
      },
    });
    const notification = await ServiceNotification.findAll({
      limit: recordLimit,
      offset: offSet,
      where: {
        [Op.and]: condition,
      },
      order: [["createdAt", "DESC"]],
    });
    // Count All unViewed notification
    const totalUnViewed = await ServiceNotification.count({
      where: {
        instructorId: req.instructor.id,
        isViewed: false,
      },
    });
    const trafData = notification.map(
      ({ notification, id, isViewed, link, createdAt }) => {
        return {
          notification,
          id,
          isViewed,
          link,
          createdAt,
          instructorName: req.instructor.name,
        };
      }
    );
    // Final Response
    res.status(200).send({
      success: true,
      message: "Service notification fetched successfully!",
      totalPage: Math.ceil(totalNotification / recordLimit),
      currentPage: currentPage,
      data: { notification: trafData, unViewedNotification: totalUnViewed },
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
