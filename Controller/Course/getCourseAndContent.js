const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;
const CourseAndContentFile = db.courseAndContentFile;
const Course_Discount_Junctions = db.course_Discount_Junction;
const Course_Student_Junctions = db.course_Student_Junction;
const Discount = db.discount;

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
                }
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
exports.getAllPendingCourse = async (req, res) => {
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
            { approvalStatusByAdmin: "Pending" }
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
                }
            }],
            order: [
                ['createdAt', 'ASC']
            ]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Pending Course fetched successfully!",
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
exports.getAllRejectedCourse = async (req, res) => {
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
            { approvalStatusByAdmin: "Rejected" }
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
            order: [
                ['createdAt', 'ASC']
            ],
            include: [{
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                }
            }]
        });
        // Final response
        res.status(200).send({
            success: true,
            message: "Pending Course fetched successfully!",
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
                    paranoid: false
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                },
                paranoid: false
            }],
            paranoid: false
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
                paranoid: false,
                include: [{
                    model: CourseAndContentFile,
                    as: 'files',
                    where: {
                        fieldName: 'ContentFile'
                    },
                    paranoid: false
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage']
                },
                paranoid: false
            }],
            paranoid: false
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
                }
            }, {
                model: Course_Discount_Junctions,
                as: 'course_Discount_Junction',
                include: [{
                    model: Discount,
                    as: 'discount'
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
                include: [{
                    model: CourseAndContentFile,
                    as: 'files',
                    where: {
                        fieldName: 'ContentFile',
                        approvalStatusByAdmin: "Approved"
                    }
                }]
            }, {
                model: CourseAndContentFile,
                as: 'files',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    approvalStatusByAdmin: "Approved"
                }
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
        // For Instructor
        if (req.instructor) {
            condition.push({ createrId: req.instructor.id });
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
                paranoid: false
            }],
            paranoid: false
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
                paranoid: false
            }],
            paranoid: false
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