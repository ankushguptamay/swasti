const db = require('../../Models');
const { Op } = require("sequelize");
const { courseValidation } = require("../../Middleware/Validate/valiadteCourse");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;

// For Admin And Instructor
exports.addCourse = async (req, res) => {
    try {
        let courseImage;
        let teacherImage;
        if (req.files) {
            if (req.files.CourseImage) {
                courseImage = req.files.CourseImage[0];
            }
            if (req.files.TeacherImage) {
                teacherImage = req.files.TeacherImage[0];
            }
        }
        // Validate body
        const { error } = courseValidation(req.body);
        if (error) {
            if (courseImage) {
                deleteSingleFile(courseImage.path);
            }
            if (teacherImage) {
                deleteSingleFile(teacherImage.path);
            }
            return res.status(400).send(error.details[0].message);
        }
        const { category, coursePrice, heading, description, level, language, courseName, duration, introVideoLink, teacherName } = req.body;
        const creater = req.admin || req.instructor;
        const createrId = creater.id;
        // store in database
        const course = await Course.create({
            category: category,
            courseName: courseName,
            coursePrice: coursePrice,
            language: language,
            heading: heading,
            description: description,
            level: level,
            duration: duration,
            teacherName: teacherName,
            introVideoLink: introVideoLink,
            createrId: createrId
        });
        if (courseImage) {
            await CourseContent.create({
                titleOrOriginalName: courseImage.originalname,
                linkOrPath: courseImage.path,
                mimeType: courseImage.mimetype,
                fileName: courseImage.filename,
                fieldName: courseImage.fieldname,
                createrId: createrId,
                courseId: course.id
            });
        }
        if (teacherImage) {
            await CourseContent.create({
                titleOrOriginalName: teacherImage.originalname,
                linkOrPath: teacherImage.path,
                mimeType: teacherImage.mimetype,
                fileName: teacherImage.filename,
                fieldName: teacherImage.fieldname,
                createrId: createrId,
                courseId: course.id
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Course Created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};