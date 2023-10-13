const db = require('../../../Models');
const Instructor = db.instructor;
const { loginInstructor, registerInstructor, changePassword } = require("../../../Middleware/Validate/validateInstructor");
const { INSTRUCTOR_JWT_SECRET_KEY, JWT_VALIDITY } = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const SALT = 10;

// register
// login
// changePassword
// getInstructor

// getAllInstructor
// getInstructorForAdmin
// registerInstructor
// softDeleteInstructor
// restoreInstructor
// verifyInstructor

exports.register = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerInstructor(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check in paranoid true
        const paranoidTrue = await Instructor.findOne({
            where: {
                email: req.body.email
            }
        });
        if (paranoidTrue) {
            return res.status(400).send({
                success: false,
                message: "Instructor is already present!"
            });
        }
        // Check in paranoid false
        const paranoidFalse = await Instructor.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            },
            attributes: { exclude: ['password'] }
        });
        if (paranoidFalse) {
            return res.status(400).send({
                success: false,
                message: "Instructor is already present! Please contact to JYANS!"
            });
        }
        // generate employee code
        let code;
        const isInstructorCode = await Instructor.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isInstructorCode.length == 0) {
            code = "INST" + 1000;
        } else {
            let lastInstructorCode = isInstructorCode[isInstructorCode.length - 1];
            let lastDigits = lastInstructorCode.instructorCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "INST" + incrementedDigits;
        }
        // Hash password
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Create instructor in database
        const instructor = await Instructor.create({
            ...req.body,
            password: hashedPassword,
            instructorCode: code
        });
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: instructor.id,
                email: req.body.email,
                instructorType: req.body.instructorType
            },
            INSTRUCTOR_JWT_SECRET_KEY,
            { expiresIn: JWT_VALIDITY } // five day
        );
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Instructor Registered successfully!',
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
        // client Ip Address and information
        // const ip = IP.address();
        // console.log("IP ADDRESS......."+ip);
        // const sendAPIRequest = async (ipAddress) => {
        //     const apiResponse = await axios.get(ABSTRACT_IP_URL + "&ip_address=" + ipAddress);
        //     return apiResponse.data;
        // }
        // const ipAddressInformation = await sendAPIRequest(ip);
        // console.log(ipAddressInformation);
        // Validate Body
        const { error } = loginInstructor(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        // If Email is already present
        const instructor = await Instructor.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Invalid email or password!"
            });
        }
        // Compare password with hashed password
        const validPassword = await bcrypt.compare(
            req.body.password,
            instructor.password
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
                id: instructor.id,
                email: req.body.email,
                instructorType: instructor.instructorType
            },
            INSTRUCTOR_JWT_SECRET_KEY,
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
        const instructor = await Instructor.findOne({
            where: {
                email: req.instructor.email
            }
        });
        // Compare current password with hashed password
        const validPassword = await bcrypt.compare(
            req.body.currentPassword,
            instructor.password
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
        await instructor.update({
            ...instructor,
            password: hashedPassword
        });
        // Generate JWT Token
        const authToken = jwt.sign(
            {
                id: instructor.id,
                email: req.body.email,
                instructorType: instructor.instructorType
            },
            INSTRUCTOR_JWT_SECRET_KEY,
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

exports.getInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findOne({
            where: {
                [Op.and]: [
                    { id: req.instructor.id }, { email: req.instructor.email }
                ]
            },
            attributes: { exclude: ['password'] }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Instructor Profile Fetched successfully!",
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllInstructor = async (req, res) => {
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
        const condition = [{
            deletedAt: { [Op.ne]: null }
        }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { eamil: { [Op.substring]: search } },
                    { instructorCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Instructor.count({
            where: {
                [Op.and]: condition
            }
        });
        const instructor = await Instructor.findAll({
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
            message: "Instructor Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getInstructorForAdmin = async (req, res) => {
    try {
        const instructor = await Instructor.findOne({
            where: {
                id: req.params.id
            },
            attributes: { exclude: ['password'] },
            paranoid: false
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: 'Instructor is not present!'
            });
        }
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Instructor Profile Fetched successfully!",
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}


exports.registerInstructor = async (req, res) => {
    try {
        // Validate Body
        const { error } = registerInstructor(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Check in paranoid true
        const paranoidTrue = await Instructor.findOne({
            where: {
                email: req.body.email
            }
        });
        if (paranoidTrue) {
            return res.status(400).send({
                success: false,
                message: "Instructor is already present!"
            });
        }
        // Check in paranoid false
        const paranoidFalse = await Instructor.findOne({
            paranoid: false,
            where: {
                email: req.body.email
            },
            attributes: { exclude: ['password'] }
        });
        if (paranoidFalse) {
            return res.status(400).send({
                success: false,
                message: "Instructor already present in soft deleted history!",
                data: paranoidFalse
            });
        }
        // generate employee code
        let code;
        const isInstructorCode = await Instructor.findAll({
            paranoid: false,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isInstructorCode.length == 0) {
            code = "INST" + 1000;
        } else {
            let lastInstructorCode = isInstructorCode[isInstructorCode.length - 1];
            let lastDigits = lastInstructorCode.instructorCode.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "INST" + incrementedDigits;
        }
        // Hash password
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Create instructor in database
        const instructor = await Instructor.create({
            ...req.body,
            password: hashedPassword,
            instructorCode: code,
            createdBy: "Admin",
            verified: true
        });
        // Email or SMS to Insturctor
        // Send final success response
        res.status(200).send({
            success: true,
            message: 'Instructor Registered successfully!'
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteInstructor = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const instructor = await Instructor.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is not present!"
            });
        }
        // soft delete
        await instructor.destroy();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Instructor Profile [${instructor.instructorCode}] soft deleted successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.restoreInstructor = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const instructor = await Instructor.findOne({
            paranoid: false,
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is not present in soft delete!"
            });
        }
        // restore
        await instructor.restore();
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Instructor Profile [${instructor.instructorCode}] restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.verifyInstructor = async (req, res) => {
    try {
        // Check perticular instructor present in database
        const instructor = await Instructor.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!instructor) {
            return res.status(400).send({
                success: false,
                message: "Instructor is not present!"
            });
        }
        // verified: true
        await instructor.update({
            ...instructor,
            verified: true
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: `Instructor Profile [${instructor.instructorCode}] restored successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}

exports.getAllDeletdInstructor = async (req, res) => {
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
        const condition = [{
            deletedAt: { [Op.ne]: null }
        }];
        if (search) {
            condition.push({
                [Op.or]: [
                    { name: { [Op.substring]: search } },
                    { eamil: { [Op.substring]: search } },
                    { instructorCode: { [Op.substring]: search } }
                ]
            })
        }
        const count = await Instructor.count({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        const instructor = await Instructor.findAll({
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
            message: "Deleted Instructor's Profile Fetched successfully!",
            totalPage: Math.ceil(count / limit),
            currentPage: currentPage,
            data: instructor
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}