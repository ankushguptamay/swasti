const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Course_Student = db.course_Student;
const CourseUpdateHistory = db.courseHistory;
const ContentUpdateHistory = db.contentHistory;
const Course_Coupon = db.course_Coupon;
const Coupon = db.coupon;
const Video = db.videos;

// For Admin and instructor
exports.getAllCourse = async (req, res) => {
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
        if (search) {
            condition.push({
                [Op.or]: [
                    { courseName: { [Op.substring]: search } },
                    { heading: { [Op.substring]: search } },
                    { category: { [Op.substring]: search } }
                ]
            })
        }
        // For Instructor
        if (req.instructor) {
            condition.push({ createrId: req.instructor.id });
        }
        // Count All Course
        const totalCourse = await Course.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course
        const course = await Course.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                },
                required: false
            }, {
                model: Course_Coupon,
                as: 'course_coupon',
                include: [{
                    model: Coupon,
                    as: 'coupon'
                }]
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Pending and reject course fetched successfully!",
            totalPage: Math.ceil(totalCourse / recordLimit),
            currentPage: currentPage,
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCourseByIdForAdmin = async (req, res) => {
    try {
        // Find in database
        const course = await Course.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: CourseContent,
                as: 'contents',
                paranoid: false,
                include: [{
                    model: CourseAndContentFile,
                    as: 'files',
                    where: {
                        fieldName: 'ContentFile'
                    },
                    required: false,
                    paranoid: false
                }, {
                    model: Video,
                    as: 'videos',
                    paranoid: false
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                },
                required: false,
                paranoid: false
            }, {
                model: Course_Coupon,
                as: 'course_coupon',
                include: [{
                    model: Coupon,
                    as: 'coupon'
                }]
            }],
            paranoid: false,
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseContent, as: "contents" }, 'createdAt', 'ASC'],
                [{ model: CourseContent, as: "contents" }, { model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC'],
                [{ model: Course_Coupon, as: "course_coupon" }, 'createdAt', 'ASC']
            ]
        });
        if (!course) {
            res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCourseByIdForInstructor = async (req, res) => {
    try {
        // Find in database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                createrId: req.instructor.id
            },
            include: [{
                model: CourseContent,
                as: 'contents',
                include: [{
                    model: CourseAndContentFile,
                    as: 'files',
                    where: {
                        fieldName: 'ContentFile'
                    },
                    required: false
                }, {
                    model: Video,
                    as: 'videos'
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                }
            }, {
                model: Course_Coupon,
                as: 'course_coupon',
                include: [{
                    model: Coupon,
                    as: 'coupon'
                }]
            }],
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseContent, as: "contents" }, 'createdAt', 'ASC'],
                [{ model: CourseContent, as: "contents" }, { model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC'],
                [{ model: Course_Coupon, as: "course_coupon" }, 'createdAt', 'ASC']
            ]
        });
        if (!course) {
            res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllApprovedCourseForStudent = async (req, res) => {
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
        // Search 
        const condition = [
            { approvalStatusByAdmin: "Approved" },
            { isPublish: true }
        ];
        if (search) {
            condition.push({
                [Op.or]: [
                    { courseName: { [Op.substring]: search } },
                    { heading: { [Op.substring]: search } },
                    { category: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Course
        const totalCourse = await Course.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course
        const course = await Course.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    approvalStatusByAdmin: "Approved",
                    isPublish: true
                },
                required: false
            }, {
                model: Course_Coupon,
                as: 'course_coupon',
                include: [{
                    model: Coupon,
                    as: 'coupon'
                }]
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Approved Course fetched successfully!",
            totalPage: Math.ceil(totalCourse / recordLimit),
            currentPage: currentPage,
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getMyCourses = async (req, res) => {
    try {
        const purchase = await Course_Student.findAll({
            where: {
                studentId: req.student.id,
                verify: true,
                status: "Paid"
            }
        });
        const courseId = [];
        for (let i = 0; i < purchase.length; i++) {
            courseId.push(purchase[i].courseId);
        }
        // All Course
        const course = await Course.findAll({
            where: {
                id: courseId,
                approvalStatusByAdmin: "Approved",
                isPublish: true
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCourseByIdForPublicStudent = async (req, res) => {
    try {
        // Find course in database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                approvalStatusByAdmin: "Approved",
                isPublish: true
            },
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    approvalStatusByAdmin: "Approved",
                    isPublish: true
                },
                required: false
            }, {
                model: CourseContent,
                as: 'contents',
                where: {
                    approvalStatusByAdmin: "Approved",
                    isPublish: true
                },
                required: false
            }, {
                model: Course_Coupon,
                as: 'course_coupon',
                include: [{
                    model: Coupon,
                    as: 'coupon'
                }]
            }]
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.myCourseByIdForStudent = async (req, res) => {
    try {
        // Check is student has this course
        const isCourseHas = await Course_Student.findOne({
            where: {
                courseId: req.params.id,
                studentId: req.student.id,
                verify: true,
                status: "Paid"
            }
        });
        if (!isCourseHas) {
            return res.status(400).send({
                success: false,
                message: "Purchase this!"
            });
        }
        // Find course in database
        const course = await Course.findOne({
            where: {
                id: req.params.id,
                approvalStatusByAdmin: "Approved",
                isPublish: true
            },
            include: [{
                model: CourseContent,
                as: 'contents',
                where: {
                    approvalStatusByAdmin: "Approved",
                    isPublish: true
                },
                required: false,
                include: [{
                    model: CourseAndContentFile,
                    as: 'files',
                    where: {
                        fieldName: 'ContentFile',
                        approvalStatusByAdmin: "Approved",
                        isPublish: true
                    },
                    required: false
                }, {
                    model: Video,
                    as: 'videos',
                    where: {
                        approvalStatusByAdmin: "Approved",
                        isPublish: true
                    },
                    required: false
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    approvalStatusByAdmin: "Approved",
                    isPublish: true
                },
                required: false
            }],
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseContent, as: "contents" }, 'createdAt', 'ASC'],
                [{ model: CourseContent, as: "contents" }, { model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC'],
            ]
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Final response
        res.status(200).send({
            success: true,
            message: "Course fetched successfully!",
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin
exports.getAllSoftDeletedCourse = async (req, res) => {
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
        // Search 
        const condition = [{ deletedAt: { [Op.ne]: null } }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { courseName: { [Op.substring]: search } },
                    { heading: { [Op.substring]: search } },
                    { category: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Course
        const totalCourse = await Course.count({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        // Get All Course
        const course = await Course.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ],
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    deletedAt: { [Op.ne]: null }
                },
                required: false,
                paranoid: false
            }],
            paranoid: false
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Soft Deleted Course fetched successfully!",
            totalPage: Math.ceil(totalCourse / recordLimit),
            currentPage: currentPage,
            data: course
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin
exports.getAllSoftDeletedContentByCourseId = async (req, res) => {
    try {
        const { search } = req.query;
        // Search 
        const condition = [{ deletedAt: { [Op.ne]: null } }];
        if (search) {
            condition.push({
                titleOrOriginalName: { [Op.substring]: search }
            })
        }
        // Get All Course Content
        const courseContent = await CourseContent.findAll({
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ],
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: 'ContentFile',
                    deletedAt: { [Op.ne]: null }
                },
                required: false,
                paranoid: false
            }, {
                model: Video,
                as: 'videos',
                where: {
                    deletedAt: { [Op.ne]: null }
                },
                required: false,
                paranoid: false
            }],
            paranoid: false,
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC'],
                [{ model: Video, as: "videos" }, 'createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Soft Deleted Course Content fetched successfully!",
            data: courseContent
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin
exports.getSoftDeletdContentByContentId = async (req, res) => {
    try {
        // Get All Course Content
        const courseContent = await CourseContent.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: 'ContentFile',
                    deletedAt: { [Op.ne]: null }
                },
                required: false,
                paranoid: false
            }, {
                model: Video,
                as: 'videos',
                where: {
                    deletedAt: { [Op.ne]: null }
                },
                required: false,
                paranoid: false
            }],
            paranoid: false,
            order: [
                [{ model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC'],
                [{ model: Video, as: "videos" }, 'createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Soft Deleted Files fetched successfully!",
            data: courseContent
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getFileByContentId = async (req, res) => {
    try {
        // Get All File
        const file = await CourseAndContentFile.findOne({
            where: {
                contentId: req.params.id,
                fieldName: 'ContentFile'
            },
            order: [
                ["createdAt", "ASC"]
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Files fetched successfully!",
            data: file
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getVideoByContentId = async (req, res) => {
    try {
        // Get All File
        const video = await Video.findOne({
            where: {
                contentId: req.params.id
            },
            order: [
                ["createdAt", "ASC"]
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Files fetched successfully!",
            data: video
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin
exports.getAllCourseUpdationRequest = async (req, res) => {
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
        let message = "Course updation request fetched successfully!";
        if (approvalStatusByAdmin) {
            message = `${approvalStatusByAdmin} course updation request fetched successfully!`;
            condition.push({ updationStatus: approvalStatusByAdmin });
        }
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { courseName: { [Op.substring]: search } },
                    { courseCode: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Course Updation
        const totalCourseUpdation = await CourseUpdateHistory.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course Updation
        const courseUpdation = await CourseUpdateHistory.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: message,
            totalPage: Math.ceil(totalCourseUpdation / recordLimit),
            currentPage: currentPage,
            data: courseUpdation
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

// For Admin
exports.getAllContentUpdationRequest = async (req, res) => {
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
        let message = "Content updation request fetched successfully!";
        if (approvalStatusByAdmin) {
            message = `${approvalStatusByAdmin} content updation request fetched successfully!`;
            condition.push({ updationStatus: approvalStatusByAdmin });
        }
        // Search
        if (search) {
            condition.push({
                [Op.or]: [
                    { title: { [Op.substring]: search } }
                ]
            })
        }
        // Count All Content Updation
        const totalContentUpdation = await ContentUpdateHistory.count({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Content Updation
        const contentUpdation = await ContentUpdateHistory.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: message,
            totalPage: Math.ceil(totalContentUpdation / recordLimit),
            currentPage: currentPage,
            data: contentUpdation
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};