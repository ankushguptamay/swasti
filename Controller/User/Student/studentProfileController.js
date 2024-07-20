const db = require("../../../Models");
const { Op } = require("sequelize");
const {} = require("../../../Middleware/Validate/validateStudent");
const { deleteSingleFile } = require("../../../Util/deleteFile");
const StudentProfile = db.studentProfile;

const { uploadFileToBunny } = require("../../../Util/bunny");
const { SHOW_BUNNY_FILE_HOSTNAME } = process.env;
const fs = require("fs");
const bunnyFolderName = "stu-doc";

exports.addUpdateStudentProfile = async (req, res) => {
  try {
    // File should be exist
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Please..upload profile photo!",
      });
    }
    //Upload file
    const fileStream = fs.createReadStream(req.file.path);
    await uploadFileToBunny(bunnyFolderName, fileStream, req.file.filename);
    // delete file from resource/servere
    deleteSingleFile(req.file.path);
    const profile = await StudentProfile.findOne({
      where: {
        studentId: req.student.id,
      },
    });
    if (profile) {
      // update deletedThrough
      await profile.update({
        ...profile,
        deletedThrough: "ByUpdation",
      });
      // soft delete previos profile
      await profile.destroy();
    }
    await StudentProfile.create({
      originalName: req.file.originalname,
      path: `${SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.file.filename}`,
      fileName: req.file.filename,
      studentId: req.student.id,
    });

    // Final response
    res.status(200).send({
      success: true,
      message: "Student Image added successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteStudentProfile = async (req, res) => {
  try {
    let condition = {
      id: req.params.id,
      studentId: req.student.id,
    };
    let deletedThrough = "Student";
    let message = "deleted";
    if (req.admin) {
      condition = {
        id: req.params.id,
      };
      deletedThrough = "Admin";
      message = "soft deleted";
    }
    const profile = await StudentProfile.findOne({
      where: condition,
    });
    if (!profile) {
      return res.status(400).send({
        success: true,
        message: "Profile photo is not present!",
      });
    }
    // update deletedThrough
    await profile.update({
      ...profile,
      deletedThrough: deletedThrough,
    });
    // soft delete previos profile
    await profile.destroy();
    // Final response
    res.status(200).send({
      success: true,
      message: `Profile photo ${message} successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
