const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Course_Student_Junctions = db.course_Student_Junction;
const Course_Coupon_Junctions = db.course_Coupon_Junction;
const Coupon = db.coupon;

// For Admin and Instructor
exports.getAllApprovedCourse = async (req, res) => {
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
            { approvalStatusByAdmin: "Approved" }
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

// For Admin and instructor
exports.getAllPendingRejectCourse = async (req, res) => {
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
        } else {
            condition.push({
                [Op.or]: [
                    { approvalStatusByAdmin: "Pending" },
                    { approvalStatusByAdmin: null },
                    { approvalStatusByAdmin: "Rejected" }
                ]
            });
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
                model: Course_Coupon_Junctions,
                as: 'course_coupon_junction',
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
                [{ model: Course_Coupon_Junctions, as: "course_coupon_junction" }, 'createdAt', 'ASC']
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
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                }
            }, {
                model: Course_Coupon_Junctions,
                as: 'course_coupon_junction',
                include: [{
                    model: Coupon,
                    as: 'coupon'
                }]
            }],
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseContent, as: "contents" }, 'createdAt', 'ASC'],
                [{ model: CourseContent, as: "contents" }, { model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC'],
                [{ model: Course_Coupon_Junctions, as: "course_coupon_junction" }, 'createdAt', 'ASC']
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
            { approvalStatusByAdmin: "Approved" }
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
                    approvalStatusByAdmin: "Approved"
                },
                required: false
            }, {
                model: Course_Coupon_Junctions,
                as: 'course_coupon_junction',
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

exports.getCourseByIdForStudent = async (req, res) => {
    try {
        // Check is student has this course
        const isCourseHas = await Course_Student_Junctions.findOne({
            where: {
                courseId: req.params.id,
                studentId: req.student.id
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
                approvalStatusByAdmin: "Approved"
            },
            include: [{
                model: CourseContent,
                as: 'contents',
                where: {
                    approvalStatusByAdmin: "Approved"
                },
                required: false,
                include: [{
                    model: CourseAndContentFile,
                    as: 'files',
                    where: {
                        fieldName: 'ContentFile',
                        approvalStatusByAdmin: "Approved"
                    },
                    required: false
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    approvalStatusByAdmin: "Approved"
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
                    approvalStatusByAdmin: "Approved",
                    deletedAt: { [Op.ne]: null }
                },
                required: false,
                paranoid: false
            }],
            paranoid: false,
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC']
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
            }],
            paranoid: false,
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC']
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
        const courseContent = await CourseContent.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: 'ContentFile'
                },
                required: false
            }],
            order: [
                ["createdAt", "ASC"],
                [{ model: CourseAndContentFile, as: "files" }, 'createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "All Files fetched successfully!",
            data: courseContent
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};