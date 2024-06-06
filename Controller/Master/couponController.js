const db = require('../../Models');
const { Op } = require("sequelize");
const { courseCouponValidation } = require('../../Middleware/Validate/validateMaster');
const { changeQualificationStatus } = require("../../Middleware/Validate/validateInstructor");
const { applyCouponToCourse } = require('../../Middleware/Validate/valiadteCourse');
const Coupon = db.coupon;
const Course = db.course;
const Course_Coupon = db.course_Coupon;
const Instructor = db.instructor;

exports.createCoupon = async (req, res) => {
    try {
        // Validate Body
        const { error } = courseCouponValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { couponTitle, discountInPercent, validTill, couponFor } = req.body;
        // generate Coupon code
        let code;
        const isCoupon = await Coupon.findAll({
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (isCoupon.length == 0) {
            code = "DISC" + 1000;
        } else {
            let lastCode = isCoupon[isCoupon.length - 1];
            let lastDigits = lastCode.couponNumber.substring(4);
            let incrementedDigits = parseInt(lastDigits, 10) + 1;
            code = "DISC" + incrementedDigits;
        }
        if (req.instructor) {
            await Coupon.create({
                couponTitle: couponTitle,
                discountInPercent: discountInPercent,
                couponFor: couponFor,
                couponNumber: code,
                createrId: req.instructor.id,
                creater: "Instructor",
                validTill: validTill,
                approvalStatusByAdmin: "Pending"
            });
        } else if (req.admin) {
            await Coupon.create({
                couponTitle: couponTitle,
                discountInPercent: discountInPercent,
                coupons: coupons,
                couponNumber: code,
                createrId: req.admin.id,
                creater: "Admin",
                validTill: validTill,
                approvalStatusByAdmin: "Approved"
            });
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not created coupon!"
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon created successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllCouponForAdmin = async (req, res) => {
    try {
        const { page, limit, search, approval } = req.query;
        // Pagination
        const recordLimit = parseInt(limit) || 10;
        let offSet = 0;
        let currentPage = 1;
        if (page) {
            offSet = (parseInt(page) - 1) * recordLimit;
            currentPage = parseInt(page);
        }
        // Search 
        const condition = [];
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { couponTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { couponNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count coupon
        const totalCoupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            }
        });
        // Get All Course
        const coupon = await Coupon.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon for approval fetched successfully!",
            totalPage: Math.ceil(totalCoupon / recordLimit),
            currentPage: currentPage,
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCouponToCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        // Search 
        const condition = { id: courseId };
        if (req.instructor) {
            condition = {
                id: courseId,
                createrId: req.instructor.id
            };
        }
        const course = await Course.findOne({
            where: condition
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "This course is not present!"
            });
        }
        // Count coupon
        const junctionRecord = await Course_Coupon.findAll({
            where: {
                courseId: courseId
            }
        });
        const couponIds = [];
        for (let i = 0; i < junctionRecord.length; i++) {
            couponIds.push(junctionRecord.couponId);
        }
        // Get All Course
        const coupon = await Coupon.findAll({
            where: {
                id: couponIds
            }
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon fetched successfully!",
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.softDeleteCoupon = async (req, res) => {
    try {
        let deletedThrough, condition, message;
        if (req.instructor) {
            condition = {
                id: req.params.id,
                createrId: req.instructor.id
            }
            deletedThrough = "Instructor";
            message = "deleted";
        } else if (req.admin) {
            condition = {
                id: req.params.id
            }
            deletedThrough = "Admin";
            message = "soft deleted";
        } else {
            return res.status(400).send({
                success: false,
                message: "You can not authorized!"
            });
        }
        // Find In database
        const coupon = await Coupon.findOne({
            where: condition
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present!'
            });
        }
        // update deletedThrough
        await coupon.update({ ...coupon, deletedThrough: deletedThrough });
        // soft delete coupon
        await coupon.destroy();
        // Final Response
        res.status(200).send({
            success: true,
            message: `Coupon ${message} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.restoreCoupon = async (req, res) => {
    try {
        // Find In database
        const coupon = await Coupon.findOne({
            where: {
                id: req.params.id,
                deletedAt: { [Op.ne]: null }
            },
            paranoid: false
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present in soft delete!'
            });
        }
        if (coupon.deletedThrough === "Instructor" || coupon.deletedThrough === "ByUpdation") {
            return res.status(400).send({
                success: true,
                message: "Warning! This Course is not deleted by Swasti!",
            });
        }
        // update deletedThrough
        await coupon.update({ ...coupon, deletedThrough: null });
        //  restore coupon
        await coupon.restore();
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon restored successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllInstructorCoupon = async (req, res) => {
    try {
        const { search, approval } = req.query;

        // Search 
        const condition = [{ createrId: req.instructor.id }];
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { couponTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { couponNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Get All Coupon
        const coupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon fetched successfully!",
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.changeCouponStatus = async (req, res) => {
    try {
        // Validate Body
        const { error } = changeQualificationStatus(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Find In database
        const coupon = await Coupon.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present!'
            });
        }
        // update coupon
        await coupon.update({
            ...coupon,
            approvalStatusByAdmin: req.body.approvalStatusByAdmin
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: `Coupon ${req.body.approvalStatusByAdmin} successfully!`
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getAllSoftDeletedCoupon = async (req, res) => {
    try {
        const { page, limit, search, approval } = req.query;
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
        if (approval) {
            condition.push({
                approvalStatusByAdmin: approval // Pending, Approved, Rejected
            })
        }
        if (search) {
            condition.push({
                [Op.or]: [
                    { couponTitle: { [Op.substring]: search } },
                    { discountInPercent: { [Op.substring]: search } },
                    { couponNumber: { [Op.substring]: search } }
                ]
            })
        }
        // Count coupon
        const totalCoupon = await Coupon.findAll({
            where: {
                [Op.and]: condition
            },
            paranoid: false
        });
        // Get All Course
        const coupon = await Coupon.findAll({
            limit: recordLimit,
            offset: offSet,
            where: {
                [Op.and]: condition
            },
            order: [
                ['createdAt', 'DESC']
            ],
            paranoid: false
        });
        // Final Response
        res.status(200).send({
            success: true,
            message: "Soft deleted coupon fetched successfully!",
            totalPage: Math.ceil(totalCoupon / recordLimit),
            currentPage: currentPage,
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.getCouponById = async (req, res) => {
    try {
        // Find In database
        const coupon = await Coupon.findOne({
            where: {
                id: req.params.id
            },
            paranoid: false
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: 'This coupon is not present!'
            });
        }
        // Final Response
        res.status(200).send({
            success: true,
            message: "Coupon fetched successfully!",
            data: coupon
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.addCouponToCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const couponId = req.body.couponId;
        let conditionForCoupon = {
            id: couponId,
            approvalStatusByAdmin: "Approved",
            couponFor: "Course"
        };
        let conditionForCourse = {
            id: courseId,
            approvalStatusByAdmin: "Approved"
        };
        if (req.instructor) {
            conditionForCoupon = {
                id: couponId,
                approvalStatusByAdmin: "Approved",
                [Op.or]: [
                    { createrId: req.instructor.id },
                    { creater: "Admin" }
                ]
            };
            conditionForCourse = {
                id: courseId,
                approvalStatusByAdmin: "Approved",
                createrId: req.instructor.id
            };
        }
        // find coupon
        const coupon = await Coupon.findOne({
            where: conditionForCoupon
        });
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: "Either coupon is not present or not approved!"
            });
        }
        // find course
        const course = await Course.findOne({
            where: conditionForCourse
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course is not present!"
            });
        }
        // Entry in junction table
        if (req.instructor) {
            const isAdded = await Course_Coupon.findOne({
                where: {
                    couponId: couponId,
                    courseId: courseId
                }
            });
            if (!isAdded) {
                const softDelete = await Course_Coupon.findOne({
                    where: {
                        couponId: couponId,
                        courseId: courseId,
                        deletedAt: { [Op.ne]: null }
                    },
                    paranoid: false
                });
                if (softDelete) {
                    if (softDelete.deletedThrough === "Admin" || softDelete.deletedThrough === "ByUpdation") {
                        return res.status(400).send({
                            success: false,
                            message: `You can not add this coupon to ${course.courseName}!`
                        });
                    } else {
                        await softDelete.update({ ...softDelete, deletedThrough: null });
                        await softDelete.restore();
                    }
                } else {
                    await Course_Coupon.create({
                        createrId: req.instructor.id,
                        creater: "Instructor",
                        couponId: couponId,
                        courseId: courseId
                    });
                }
            }
        } else if (req.admin) {
            const isAdded = await Course_Coupon.findOne({
                where: {
                    couponId: couponId,
                    courseId: courseId
                }
            });
            if (!isAdded) {
                const softDelete = await Course_Coupon.findOne({
                    where: {
                        couponId: couponId,
                        courseId: courseId,
                        deletedAt: { [Op.ne]: null }
                    },
                    paranoid: false
                });
                if (softDelete) {
                    if (softDelete.deletedThrough === "Instructor" || softDelete.deletedThrough === "ByUpdation") {
                        return res.status(400).send({
                            success: false,
                            message: `You can not add this coupon to ${course.courseName}!`
                        });
                    } else {
                        await softDelete.update({ ...softDelete, deletedThrough: null });
                        await softDelete.restore();
                    }
                } else {
                    await Course_Coupon.create({
                        createrId: req.admin.id,
                        creater: "Admin",
                        couponId: couponId,
                        courseId: courseId
                    });
                }
            }
        } else {
            return res.status(400).send({
                success: true,
                message: "You can not add coupon to course!"
            });
        }
        res.status(200).send({
            success: true,
            message: "Coupon added to course successfully!"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
};

exports.applyCouponToCourse = async (req, res) => {
    try {
        // Validate Body
        const { error } = applyCouponToCourse(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { couponNumber, courseId } = req.body;
        const coupon = await Coupon.findOne({
            where: {
                couponNumber: couponNumber,
                couponFor: "Course"
            }
        });
        // is coupon present?
        if (!coupon) {
            return res.status(400).send({
                success: false,
                message: `This coupon is not present!`
            });
        }
        // is coupon expired?
        if (coupon.validTill) {
            const isCouponExpired = new Date().getTime() > parseInt(coupon.validTill);
            if (isCouponExpired) {
                return res.status(400).send({
                    success: false,
                    message: `This coupon has expired!`
                });
            }
        }
        // find course
        const course = await Course.findOne({
            where: {
                id: courseId
            }
        });
        if (!course) {
            return res.status(400).send({
                success: false,
                message: `This course is not present!`
            });
        }
        // Check is coupon apply on this course
        const isCourseHasCoupon = await Course_Coupon.findOne({
            where: {
                courseId: courseId,
                couponId: coupon.id
            }
        });
        if (!isCourseHasCoupon) {
            res.status(400).send({
                success: false,
                message: `This coupon is not applicable on this course!`
            });
        }
        // check applicable time
        if (isCourseHasCoupon.validTill) {
            const isCouponExpired = new Date().getTime() > parseInt(isCourseHasCoupon.validTill);
            if (isCouponExpired) {
                return res.status(400).send({
                    success: false,
                    message: `This coupon has expired!`
                });
            }
        }
        const savedMoney = (parseInt(course.coursePrice) * parseInt(coupon.discountInPercent)) / 100;
        const payableMoney = parseInt(course.coursePrice) - savedMoney;
        res.status(201).send({
            success: true,
            message: `Coupon applied to course ${course.courseName} successfully!`,
            data: {
                savedMoney: savedMoney,
                payableMoney: payableMoney
            }
        });

    }
    catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};