const db = require('../../Models');
const { Op } = require("sequelize");
const Course = db.course;
const CourseContent = db.courseContent;

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
                model: CourseContent,
                as: 'contents',
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
                model: CourseContent,
                as: 'contents',
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
                model: CourseContent,
                as: 'contents',
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
                model: CourseContent,
                as: 'contents',
                where: {
                    fieldName: ['TeacherImage', 'CourseImage'],
                    approvalStatusByAdmin: "Approved"
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

exports.getCourseByIdForStudent = async (req, res) => {
    try {
        // Find in database
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
                }
            }]
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
                model: CourseContent,
                as: 'contents',
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
        let condition;
        if (search) {
            condition.push({
                titleOrOriginalName: { [Op.substring]: search },
                deletedAt: { [Op.ne]: null }
            })
        }
        // Get All Course Content
        const courseContent = await CourseContent.findAll({
            where: condition,
            order: [
                ['createdAt', 'ASC']
            ],
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