const db = require('../../Models');
const Admin = db.admin;
const { adminLogin, adminRegistration, changePassword } = require("../../Middleware/Validate/validateAdmin");
const { ADMIN_JWT_SECRET_KEY, JWT_VALIDITY } = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const SALT = 10;

// register
// login
// changePassword
// getAdmin

exports.register = async (req, res) => {
    try {
        // Validate Body
        const { error } = adminRegistration(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // If Email is already present
        const isAdmin = await Admin.findOne({
            where: {
                email: req.body.email,
            }
        });
        if (isAdmin) {
            return res.status(400).send({
                success: false,
                message: "Admin already present!"
            });
        }
        // Hash password
        const salt = await bcrypt.genSalt(SALT);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Create admin in database
        const admin = await Admin.create({
            ...req.body,
            password: hashedPassword
        });
        // generate JWT Token
        const authToken = jwt.sign(
            {
                id: admin.id,
                email: req.body.email
            },
            ADMIN_JWT_SECRET_KEY,
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
        const { error } = adminLogin(req.body);
        if (error) {
            console.log(error);
            return res.status(400).send(error.details[0].message);
        }
        // If Email is already present
        const admin = await Admin.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!admin) {
            return res.status(400).send({
                success: false,
                message: "Invalid email or password!"
            });
        }
        // Compare password with hashed password
        const validPassword = await bcrypt.compare(
            req.body.password,
            admin.password
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
                id: admin.id,
                email: req.body.email
            },
            ADMIN_JWT_SECRET_KEY,
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
        const admin = await Admin.findOne({
            where: {
                email: req.admin.email
            }
        });
        // Compare current password with hashed password
        const validPassword = await bcrypt.compare(
            req.body.currentPassword,
            admin.password
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
        await admin.update({
            ...admin,
            password: hashedPassword
        });
        // Generate JWT Token
        const authToken = jwt.sign(
            {
                id: admin.id,
                email: req.body.email
            },
            ADMIN_JWT_SECRET_KEY,
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

exports.getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findOne({
            where: {
                [Op.and]: [
                    { id: req.admin.id }, { email: req.admin.email }
                ]
            }
        });
        // Send final success response
        res.status(200).send({
            success: true,
            message: "Admin Profile Fetched successfully!",
            data: admin
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
}