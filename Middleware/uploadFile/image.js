const path = require("path");
const multer = require("multer");

const filter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Please upload only Image or PDF.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "CourseImage") {
            cb(null, path.join(`${__dirname}/../../Resource/Course`));
        } else if (file.fieldname === "TeacherImage") {
            cb(null, path.join(`${__dirname}/../../Resource/Course`));
        }
    },
    filename: (req, file, callback) => {
        var filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
    }
});
uploadImage = multer({ storage: storage, fileFilter: filter });

module.exports = uploadImage;