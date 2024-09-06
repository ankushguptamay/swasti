const db = require("../../Models");
const {
  bookHTValidation,
} = require("../../Middleware/Validate/validateHomeTutor");
const HTServiceArea = db.hTServiceArea;
const HTBooking = db.hTBooking;
const UserSlote = db.userSlote;
const HTTimeSlot = db.hTTimeSlote;
const HomeTutor = db.homeTutor;
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET_ID } = process.env;
const { Op } = require("sequelize");

// Razorpay
const Razorpay = require("razorpay");
const crypto = require("crypto");
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET_ID,
});

exports.createHTOrder = async (req, res) => {
  try {
    // Validate body
    const { error } = bookHTValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const {
      amount,
      currency,
      receipt,
      couponCode,
      timeSloteId,
      userPreferedLanguage,
    } = req.body; // receipt is id created for this order
    const userId = req.student.id;
    const timeSlote = await HTTimeSlot.findOne({
      where: { id: timeSloteId, appointmentStatus: "Active", isBooked: false },
    });
    if (!timeSlote) {
      return res.status(400).send({
        success: false,
        message: "This slote is not present or can not be book!",
      });
    }
    // 3 days validity
    const date = timeSlote.date;
    // const date1 = JSON.stringify(new Date());
    // const date2 = JSON.stringify(new Date((new Date).getTime() + (1 * 24 * 60 * 60 * 1000)));
    // const date3 = JSON.stringify(new Date((new Date).getTime() + (2 * 24 * 60 * 60 * 1000)));
    // const array = [`${date1.slice(1, 11)}`, `${date2.slice(1, 11)}`, `${date3.slice(1, 11)}`]
    // if (array.indexOf(date) === -1) {
    //     return res.status(400).send({
    //         success: false,
    //         message: "Can't book more then three days slote!"

    //     });
    // }
    // Validate date
    const yesterday = new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000);
    const bookingDate = new Date(date).getTime();
    if (bookingDate <= yesterday) {
      return res.status(400).send({
        success: false,
        message: "Can't book this slote!",
      });
    }
    let noOfBooking = req.body.noOfBooking;
    // Number
    if (timeSlote.serviceType === "Private") {
      noOfBooking = 1;
    }
    // Group class validation
    if (timeSlote.serviceType === "Group") {
      const findBooked = await HTBooking.findAll({
        where: {
          timeSloteId: timeSloteId,
          status: "Paid",
          verify: true,
        },
      });
      if (findBooked.length >= parseInt(timeSlote.noOfPeople)) {
        return res.status(400).send({
          success: false,
          message: "This group class is already full! Please try another!",
        });
      }
    }
    await timeSlote.update({
      ...timeSlote,
      userPreferedLanguage: userPreferedLanguage,
    });
    // initiate payment
    razorpayInstance.orders.create(
      { amount, currency, receipt },
      (err, order) => {
        if (!err) {
          HTBooking.create({
            noOfBooking: noOfBooking,
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
            couponCode: couponCode,
          })
            .then(() => {
              res.status(201).send({
                success: true,
                message: `Order craeted successfully!`,
                data: order,
              });
            })
            .catch((err) => {
              res.status(500).send({
                success: false,
                err: err.message,
              });
            });
        } else {
          res.status(500).send({
            success: false,
            err: err.message,
          });
        }
      }
    );
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.verifyHTPayment = async (req, res) => {
  try {
    const orderId = req.body.razorpay_order_id;
    const paymentId = req.body.razorpay_payment_id;
    const razorpay_signature = req.body.razorpay_signature;
    // Creating hmac object
    let hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_ID);
    // Passing the data to be hashed
    hmac.update(orderId + "|" + paymentId);
    // Creating the hmac in the required format
    const generated_signature = hmac.digest("hex");
    const purchase = await HTBooking.findOne({
      where: {
        razorpayOrderId: orderId,
        verify: false,
        status: "Created",
      },
    });
    if (!purchase) {
      res.status(400).json({
        success: false,
        message: "This payment order is not present!",
      });
    } else if (purchase.verify === false && purchase.status === "Created") {
      if (razorpay_signature === generated_signature) {
        const timeSlote = await HTTimeSlot.findOne({
          where: { id: purchase.timeSloteId },
        });
        await timeSlote.update({
          ...timeSlote,
          isBooked: true,
        });
        await UserSlote.create({
          sloteId: purchase.timeSloteId,
          paidThroung: "Online",
          userId: purchase.userId,
        });
        // Update Purchase
        await purchase.update({
          ...purchase,
          status: "Paid",
          razorpayPaymentId: paymentId,
          verify: true,
        });
        res.status(200).json({
          success: true,
          message: "Payment verified successfully!",
        });
      } else {
        await purchase.update({
          ...purchase,
          status: "Failed",
        });
        res.status(400).json({
          success: false,
          message: "Payment verification failed!",
        });
      }
    } else if (purchase.verify === true && purchase.status === "Paid") {
      res.status(200).json({
        success: true,
        message: "Payment has been verified!",
      });
    } else {
      res.status(400).json({
        success: true,
        message: "Unexpected error!",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      err: err.message,
    });
  }
};

exports.getMyHTBookedSloteForUser = async (req, res) => {
  try {
    const booking = await UserSlote.findAll({
      where: {
        userId: req.student.id,
      },
    });
    const sloteId = [];
    for (let i = 0; i < booking.length; i++) {
      sloteId.push(booking[i].timeSloteId);
    }
    const slote = await HTTimeSlot.findAll({
      where: { id: sloteId },
      include: [{ model: HTServiceArea, as: "serviceArea" }],
    });
    // Final Response
    res.status(200).send({
      success: true,
      message: "My home tutor booked slote fetched successfully!",
      data: slote,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.getMyHTBookedSloteForInstructor = async (req, res) => {
  try {
    const { date, isBooked, search } = req.query;
    // 3 days validity
    const date1 = JSON.stringify(new Date());
    const date2 = JSON.stringify(
      new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
    );
    const date3 = JSON.stringify(
      new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
    );
    let dateCondition;
    if (date) {
      // const array = [`${date1.slice(1, 11)}`, `${date2.slice(1, 11)}`, `${date3.slice(1, 11)}`]
      // if (array.indexOf(date) === -1) {
      //     return res.status(400).send({
      //         success: false,
      //         message: "Date should be with in required limit!"
      //     });
      // } else {
      //     dateCondition = date;
      // }
      dateCondition = date;
    } else {
      dateCondition = date1.slice(1, 11);
    }
    // Get instructor Home tutor
    const homeTutor = await HomeTutor.findAll({
      where: {
        instructorId: req.instructor.id,
        isPublish: true,
      },
    });
    const homeTutorId = [];
    for (let i = 0; i < homeTutor.length; i++) {
      homeTutorId.push(homeTutor[i].id);
    }
    // Where condition
    const condition = [{ id: homeTutorId }, { date: dateCondition }];
    const slote = await HTTimeSlot.findAll({
      where: {
        [Op.and]: condition,
      },
    });
    if (isBooked) {
      condition.push({ isBooked: isBooked });
    } else {
      condition.push({ isBooked: true });
    }
    if (search) {
      condition.push({
        [Op.or]: [{ sloteCode: { [Op.substring]: search } }],
      });
    }
    // Final Response
    res.status(200).send({
      success: true,
      message: "My home tutor booked slote fetched successfully!",
      data: slote,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};
