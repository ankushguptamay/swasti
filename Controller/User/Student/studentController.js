const db = require('../../../Models');
const Student = db.student;
const StudentProfile = db.studentProfile;
const { loginStudent, registerStudent, changePassword } = require("../../../Middleware/Validate/validateStudent");
const { STUDENT_JWT_SECRET_KEY, JWT_VALIDITY } = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const SALT = 10;

// register
// login
// changePassword
// getStudent

// getAllStudent
// getStudentForAdmin
// registerStudent
// softDeleteStudent
// restoreStudent
// verifyStudent

exports.register = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerStudent(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check in paranoid true
        const paranoidTrue = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        if (paranoidTrue) {
            return res.status(400).send({
                success: false,
                message: "Student is already present!"
            });
        }
        // Check in paranoid false
        const paranoidFalse = await Student.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            }
        });
        if (paranoidFalse) {
            return res.status(400).send({
                success: false,
                message: "Student is already present! Please contact to JYAN!"
            });
        }
        // generate employee code
        let code;
        const isStudentCode = await Student.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isStudentCode.length == 0) {
            code = "STUD" + 1000;
        } else {
            let lastStudentCode = isStudentCode[isStudentCode.length - 1];
            let lastDigits = lastStudentCode.studentCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "STUD" + incrementedDigits;
        }
        // Hash password
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Create student in database
        const student = await Student.create({
            ...req.body,
            password: hashedPassword,
            studentCode: code
        });
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: student.id,
                email: req.body.email
            },
            STUDENT_JWT_SECRET_KEY,
            { expiresIn: JWT_VALIDITY } // five day
        );
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Registered successfully!',
            authToken: authToken
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        // Validate Body
        const { error } = loginStudent(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        // If Email is already present
        const student = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Invalid email or password!"
            });
        }
        // Compare password with hashed password
        const validPassword = await bcrypt.compare(
            req.body.password,
            student.password
        );
        if (!validPassword) {
            return res.status(400).send({
                success: false,
                message: "Invalid email or password!"
            });
        }
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: student.id,
                email: req.body.email
            },
            STUDENT_JWT_SECRET_KEY,
            { expiresIn: JWT_VALIDITY } // five day
        );
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Loged in successfully!',
            authToken: authToken
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        // Validate Body
        const { error } = changePassword(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        const student = await Student.findOne({
            where: {
                email: req.student.email
            }
        });
        // Compare current password with hashed password
        const validPassword = await bcrypt.compare(
            req.body.currentPassword,
            student.password
        );
        if (!validPassword) {
            return res.status(400).send({
                success: false,
                message: "Invalid current password!"
            });
        }
        // Generate hash password of newPassword
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
        await student.update({
            ...student,
            password: hashedPassword
        });
        // Generate JWT Token
        const authToken = jwt.sign(
            {
                id: student.id,
                email: req.body.email
            },
            STUDENT_JWT_SECRET_KEY,
            { expiresIn: JWT_VALIDITY } // five day
        );
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Password changed successfully!',
            authToken: authToken
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            where: {
                [Op.and]: [
                    { id: req.student.id }, { email: req.student.email }
                ]
            },
            include: [{
                model: StudentProfile,
                as: "profile",
                where: {
                    approvalStatusByAdmin: "Approved"
                }
            }],
            attributes: { exclude: ['password'] }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Student Profile Fetched successfully!",
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllStudent = async (req, res) => {
    try {
        const { page, search } = req.query;
        // Pagination
        const limit = req.query.limit || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * limit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { email: { [Op.substring]: search } },
                    { studentCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Student.count({
            where: {
                [Op.and]: condition
            }
        });
        const student = await Student.findAll({
            limit: limit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            attributes: { exclude: ['password'] }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Student Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getStudentForAdmin = async (req, res) => {
    try {
        const student = await Student.findOne({
            where: {
                id: req.params.id
            },
            attributes: { exclude: ['password'] },
            paranoid: false
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: 'Student is not present!'
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Student Profile Fetched successfully!",
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.registerStudent = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerStudent(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check in paranoid true
        const paranoidTrue = await Student.findOne({
            where: {
                email: req.body.email
            }
        });
        if (paranoidTrue) {
            return res.status(400).send({
                success: false,
                message: "Student is already present!"
            });
        }
        // Check in paranoid false
        const paranoidFalse = await Student.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            }
        });
        if (paranoidFalse) {
            return res.status(400).send({
                success: false,
                message: "Student is present in soft delete!",
                data: paranoidFalse
            });
        }
        // generate employee code
        let code;
        const isStudentCode = await Student.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isStudentCode.length == 0) {
            code = "STUD" + 1000;
        } else {
            let lastStudentCode = isStudentCode[isStudentCode.length - 1];
            let lastDigits = lastStudentCode.studentCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "STUD" + incrementedDigits;
        }
        // Hash password
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Create student in database
        const student = await Student.create({
            ...req.body,
            password: hashedPassword,
            studentCode: code,
            createdBy: "Admin",
            verified: true
        });
        // Email or SMS to Student
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Registered successfully!'
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteStudent = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const student = await Student.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Student is not present!"
            });
        }
        // soft delete
        await student.destroy();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student Profile [${student.studentCode}] soft deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.restoreStudent = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const student = await Student.findOne({
            paranoid: false,
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Student is not present in soft delete!"
            });
        }
        // restore
        await student.restore();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student Profile [${student.studentCode}] restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.verifyStudent = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const student = await Student.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!student) {
            return res.status(400).send({
                success: false,
                message: "Student is not present!"
            });
        }
        // verified : true
        await student.update({
            ...student,
            verified: true
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Student Profile [${student.studentCode}] verified successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllDeletedStudent = async (req, res) => {
    try {
        const { page, search } = req.query;
        // Pagination
        const limit = req.query.limit || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * limit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [
            { deletedAt: { [Op.ne]: null } }
        ];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { eamil: { [Op.substring]: search } },
                    { studentCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Student.count({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        const student = await Student.findAll({
            limit: limit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            paranoid: false,
            attributes: { exclude: ['password'] }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Deleted Student's Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: student
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}