const db = require("../../Models");
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile");
const { uploadFileToBunny, deleteFileToBunny } = require("../../Util/bunny");
const { SHOW_BUNNY_FILE_HOSTNAME } = process.env;
const AdminBanner = db.adminBanner;
const fs = require("fs");
const bunnyFolderName = "mst-doc";

exports.addAdminBanner = async (req, res) => {
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
    await AdminBanner.create({
      originalName: req.file.originalname,
      path: `${SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.file.filename}`,
      fileName: req.file.filename,
    });

    // Final response
    res.status(200).send({
      success: true,
      message: "Banner Image added successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getAdminBanner = async (req, res) => {
  try {
    const banner = await AdminBanner.findAll();

    // Final response
    res.status(200).send({
      success: true,
      message: "Banner Image fetched successfully!",
      data: banner,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteAdminBanner = async (req, res) => {
  try {
    const banner = await AdminBanner.findOne({ where: { id: req.params.id } });
    if (!banner) {
      return res.status(400).send({
        success: false,
        message: "This banner image is not present!",
      });
    }
    if (banner.fileName) {
      await deleteFileToBunny(bunnyFolderName, banner.fileName);
    }
    await banner.destroy();
    // Final response
    res.status(200).send({
      success: true,
      message: "Banner Image deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
