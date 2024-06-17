const db = require('../../Models');
const { bookHTValidation } = require('../../Middleware/Validate/validateHomeTutor');
const HTBooking = db.hTBooking;
const HTTimeSlot = db.hTTimeSlote;
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

exports.createHTOrder = async (req, res) => {
    try {
        // Validate body
        const { error } = bookHTValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { amount, currency, receipt, couponCode, timeSloteId } = req.body; // receipt is id created for this order
        const userId = req.student.id;
        const timeSlote = await HTTimeSlot.findOne({ where: { id: timeSloteId, appointmentStatus: "Active", isBooked: false } });
        if (!timeSlote) {
            return res.status(400).send({
                success: false,
                message: "This slote is not present or can not be book!"
            });
        }
        // 3 days validity
        const date = timeSlote.date;
        const date1 = JSON.stringify(new Date());
        const date2 = JSON.stringify(new Date((new Date).getTime() + (1 * 24 * 60 * 60 * 1000)));
        const date3 = JSON.stringify(new Date((new Date).getTime() + (2 * 24 * 60 * 60 * 1000)));
        const array = [`${date1.slice(1, 11)}`, `${date2.slice(1, 11)}`, `${date3.slice(1, 11)}`]
        if (array.indexOf(date) === -1) {
            return res.status(400).send({
                success: false,
                message: "Can't book more then three days slote!"

            });
        }
        // Group class validation
        if (timeSlote.serviceType === "Group") {
            const findBooked = await HTBooking.findAll({
                where: {
                    timeSloteId: timeSloteId,
                    status: "Paid",
                    verify: true
                }
            });
            if (findBooked.length >= parseInt(timeSlote.noOfPeople)) {
                return res.status(400).send({
                    success: false,
                    message: "This group class is already full! Please try another!"

                });
            }
        }
        // initiate payment
        razorpayInstance.orders.create({ amount, currency, receipt },
            (err, order) => {
                if (!err) {
                    HTBooking.create({
                        timeSloteId: timeSloteId,
                        homeTutorId: timeSlote.homeTutorId,
                        userId: userId,
                        amount: amount / 100,
                        userName: req.studentName,
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

exports.verifyHTPayment = async (req, res) => {
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
        const purchase = await HTBooking.findOne({
            where: {
                razorpayOrderId: orderId,
                verify: false,
                status: "Created"
            }
        });
        if (!purchase) {
            res.status(400).json({
                success: false,
                message: "This payment order is not present!"
            });
        } else if (purchase.verify === false && purchase.status === "Created") {
            if (razorpay_signature === generated_signature) {
                const timeSlote = await HTTimeSlot.findOne({ where: { id: purchase.timeSloteId } });
                if (timeSlote.serviceType === "Private") {
                    await timeSlote.update({ isBooked: true });
                } else {
                    const findBooked = await HTBooking.findAll({
                        where: {
                            timeSloteId: purchase.timeSloteId,
                            status: "Paid",
                            verify: true
                        }
                    });
                    const noOfPeople = parseInt(timeSlote.noOfPeople) - 1;
                    if (findBooked.length === noOfPeople) {
                        await timeSlote.update({ isBooked: true });
                    }
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
        } else if (purchase.verify === true && purchase.status === "Paid") {
            res.status(200).json({
                success: true,
                message: "Payment has been verified!"
            });
        } else {
            res.status(400).json({
                success: true,
                message: "Unexpected error!"
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
