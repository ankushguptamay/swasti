const db = require('../../../Models');
const { purchaseCourseValidation } = require("../../../Middleware/Validate/valiadteCourse");
const Course_Student = db.course_Student;
const Course = db.course;
const Student = db.student;
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID } = process.env;
const { Op } = require('sequelize');

// Razorpay
const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET_ID
});

exports.createOrder = async (req, res) => {
    try {
        // Validate body
        const { error } = purchaseCourseValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { amount, currency, receipt, couponCode, courseId } = req.body; // receipt is id created for this order
        const studentId = req.student.id;
        // initiate payment
        razorpayInstance.orders.create({ amount, currency, receipt },
            (err, order) => {
                if (!err) {
                    Course_Student.create({
                        courseId: courseId,
                        userId: studentId,
                        studentId: amount / 100,
                        currency: currency,
                        receipt: receipt,
                        razorpayOrderId: order.id,
                        status: "Created",
                        razorpayTime: order.created_at,
                        verify: false,
                        couponCode: couponCode
                    })
                        .then(() => {
                            res.status(201).send({
                                success: true,
                                message: `Order craeted successfully!`,
                                data: order
                            });
                        })
                        .catch((err) => {
                            res.status(500).send({
                                success: false,
                                err: err.message
                            });
                        });
                }
                else {
                    res.status(500).send({
                        success: false,
                        err: err.message
                    });
                }
            })
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const orderId = req.body.razorpay_order_id;
        const paymentId = req.body.razorpay_payment_id;
        const razorpay_signature = req.body.razorpay_signature;
        // Creating hmac object 
        let hmac = crypto.createHmac('sha256', RAZORPAY_SECRET_ID);
        // Passing the data to be hashed
        hmac.update(orderId + "|" + paymentId);
        // Creating the hmac in the required format
        const generated_signature = hmac.digest('hex');
        const purchase = await Course_Student.findOne({
            where: {
                razorpayOrderId: orderId,
                verify: false,
                status: "Created"
            }
        });
        if (razorpay_signature === generated_signature) {
            if (!purchase) {
                return res.status(200).json({
                    success: true,
                    message: "Payment has been verified! Second Time!"
                });
            }
            // Update Purchase
            await purchase.update({
                ...purchase,
                status: "Paid",
                razorpayPaymentId: paymentId,
                verify: true
            });
            res.status(200).json({
                success: true,
                message: "Payment verified successfully!"
            })
        }
        else {
            await purchase.update({
                ...purchase,
                status: "Failed"
            });
            res.status(400).json({
                success: false,
                message: "Payment verification failed!"
            });
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};