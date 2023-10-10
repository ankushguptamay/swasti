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
        if (file.fieldname === "courseImage") {
            cb(null, path.join(`${__dirname}/../../Resource/CourseImage`));
        } else if (file.fieldname === "categoryThumbnail") {
            cb(null, path.join(`${__dirname}/../../Resource/CategoryThumbnail`));
        } else if (file.fieldname === "teacherImage") {
            cb(null, path.join(`${__dirname}/../../Resource/TeacherImage`));
        } else if (file.fieldname === "bannerImage") {
            cb(null, path.join(`${__dirname}/../../Resource/BannerImage`));
        }
    },
    filename: (req, file, callback) => {
        var filename = `${Date.now()}-${file.originalname}`;
        callback(null, filename);
    }
});
uploadImage = multer({ storage: storage, fileFilter: filter });

module.exports = uploadImage;