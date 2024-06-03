const db = require('../../Models');
const { Op } = require("sequelize");
const { courseValidation, contentUpdationValidation } = require("../../Middleware/Validate/valiadteCourse");
const { capitalizeFirstLetter } = require("../../Util/capitalizeFirstLetter");
const { deleteSingleFile } = require("../../Util/deleteFile")
const Course = db.course;
const CourseContent = db.courseContent;
const Course_Coupon = db.course_Coupon;
const CourseUpdateHistory = db.courseHistory;
const ContentUpdateHistory = db.contentHistory;
const Course_Student = db.course_Student;
const Coupon = db.coupon;
const Video = db.videos;

exports.updateCourseForInstructor = async (req, res) => {
    try {
        // Validate body
        const { error } = courseValidation(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { category, coursePrice, heading, description, level, language, duration, introVideoLink, teacherName, certificationType,
            certificationFromInstitute, startingTime, endingTime, startingDate } = req.body;
        // Find Course in database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id,
                creater: "Instructor"
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Check is course name is changed
        let courseName = course.courseName;
        console.log(courseName);
        const newCourseName = capitalizeFirstLetter(req.body.courseName);
        if (courseName !== newCourseName) {
            const isCourse = await Course.findOne({
                where: {
                    courseName: newCourseName
                },
                paranoid: false
            });
            if (isCourse) {
                return res.status(400).send({
                    success: false,
                    message: "This course name is present!"
                });
            } else {
                courseName = newCourseName;
            }
        }
        // If course status is not changed by admin then update it
        if (course.approvalStatusByAdmin === null || course.approvalStatusByAdmin === "Pending") {
            await course.update({
                ...course,
                startingDate: startingDate,
                endingTime: endingTime,
                startingTime: startingTime,
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
                certificationType: certificationType,
                certificationFromInstitute: certificationFromInstitute,
            });
        }
        // Delete all updation request which status is pending
        await CourseUpdateHistory.destroy({
            where: {
                courseId: course.id,
                updationStatus: "Pending"
            }
        });
        //Create Updation request
        await CourseUpdateHistory.create({
            startingDate: startingDate,
            endingTime: endingTime,
            startingTime: startingTime,
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
            certificationType: certificationType,
            certificationFromInstitute: certificationFromInstitute,
            createrId: req.instructor.id,
            updationStatus: "Pending",
            courseId: course.id,
            creater: "Instructor"
        })
        res.status(200).send({
            success: true,
            message: "Course updated successfully! wait for SWASTI approval!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err
        });
    }
};

exports.updateCourseForAdmin = async (req, res) => {
    try {
        // Validate body
        const { error } = courseValidation(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { category, coursePrice, heading, description, level, language, duration, introVideoLink, teacherName, certificationType,
            certificationFromInstitute, startingTime, endingTime, startingDate } = req.body;
        // Find Course in database
        const course = await Course.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Check is course name is changed
        let courseName = course.courseName;
        const newCourseName = capitalizeFirstLetter(req.body.courseName);
        if (courseName !== newCourseName) {
            const isCourse = await Course.findOne({
                where: {
                    courseName: newCourseName
                },
                paranoid: false
            });
            if (isCourse) {
                return res.status(400).send({
                    success: false,
                    message: "This course name is present!"
                });
            } else {
                courseName = newCourseName;
            }
        }
        // If course status is not changed by admin then update it
        await course.update({
            ...course,
            startingDate: startingDate,
            endingTime: endingTime,
            startingTime: startingTime,
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
            certificationType: certificationType,
            certificationFromInstitute: certificationFromInstitute,
            approvalStatusByAdmin: "Approved"
        });

        // Delete all updation request which status is pending
        await CourseUpdateHistory.destroy({
            where: {
                courseId: course.id,
                updationStatus: "Pending"
            }
        })
        //Create Updation request
        await CourseUpdateHistory.create({
            startingDate: startingDate,
            endingTime: endingTime,
            startingTime: startingTime,
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
            certificationType: certificationType,
            certificationFromInstitute: certificationFromInstitute,
            createrId: req.admin.id,
            updationStatus: "Approved",
            cousreId: course.id,
            creater: "Admin"
        })
        res.status(200).send({
            success: true,
            message: "Course updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateContentForInstructor = async (req, res) => {
    try {
        // Validate body
        const { error } = contentUpdationValidation(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { title } = req.body;
        // Find Content in database
        const content = await CourseContent.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id,
                creater: "Instructor"
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "Content is not present!"
            });
        }
        // If content status is not changed by admin then update it
        if (content.approvalStatusByAdmin === null || content.approvalStatusByAdmin === "Pending") {
            await content.update({
                ...content,
                title: title
            });
        }
        // Delete all updation request which status is pending
        await ContentUpdateHistory.destroy({
            where: {
                contentId: content.id,
                updationStatus: "Pending"
            }
        })
        //Create Updation request
        await ContentUpdateHistory.create({
            title: title,
            createrId: req.instructor.id,
            updationStatus: "Pending",
            contentId: content.id,
            creater: "Instructor"
        });
        res.status(200).send({
            success: true,
            message: "Content updated successfully! wait for SWASTI approval!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.updateContentForAdmin = async (req, res) => {
    try {
        // Validate body
        const { error } = contentUpdationValidation(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const { title } = req.body;
        // Find Content in database
        const content = await CourseContent.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!content) {
            return res.status(400).send({
                success: false,
                message: "Content is not present!"
            });
        }
        // If content status is not changed by admin then update it
        await content.update({
            ...content,
            title: title,
            approvalStatusByAdmin: "Approved"
        });

        // Delete all updation request which status is pending
        await ContentUpdateHistory.destroy({
            where: {
                contentId: content.id,
                updationStatus: "Pending"
            }
        })
        //Create Updation request
        await ContentUpdateHistory.create({
            title: title,
            createrId: req.admin.id,
            updationStatus: "Approved",
            contentId: content.id,
            creater: "Admin"
        })
        res.status(200).send({
            success: true,
            message: "Content updated successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.studentToCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).send({
                success: true,
                message: "Select a student!"
            });
        }
        // find course
        const course = await Course.findOne({
            where: {
                id: courseId
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Entry in junction table
        await Course_Student.create({
            studentId: studentId,
            courseId: courseId,
            verify: true,
            status: "paid"
        });
        res.status(200).send({
            success: true,
            message: "Course added to Student successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};