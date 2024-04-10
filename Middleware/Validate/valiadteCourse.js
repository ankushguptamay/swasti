const joi = require('joi');

exports.courseValidation = (data) => {
    const schema = joi.object().keys({
        category: joi.string().optional(),
        coursePrice: joi.string().optional(),
        heading: joi.string().optional(),
        description: joi.string().optional(),
        level: joi.string().optional(),
        language: joi.string().optional(),
        courseName: joi.string().required(),
        duration: joi.string().optional(),
        introVideoLink: joi.string().optional(),
        teacherName: joi.string().optional(),
        certificationFromInstitute: joi.string().optional(),
        certificationType: joi.string().optional()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.contentValidation = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required(),
        courseId: joi.string().required()
    });
    return schema.validate(data);
}

exports.contentVideoValidation = (data) => {
    const schema = joi.object().keys({
        titleOrOriginalName: joi.string().required(),
        linkOrPath: joi.string().required()
    });
    return schema.validate(data);
}

exports.applyCouponToCourse = (data) => {
    const schema = joi.object().keys({
        couponNumber: joi.string().required(),
        courseId: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.purchaseCourseValidation = (data) => {
    const schema = joi.object().keys({
        amount: joi.string().required(),
        currency: joi.string().required(),
        receipt: joi.string().required(),
        couponCode: joi.string().optional(),
        courseId: joi.string().required()
    });
    return schema.validate(data);
}

exports.createOrderYogaVolunteerCourse = (data) => {
    const schema = joi.object().keys({
        amount: joi.string().required(),
        currency: joi.string().required(),
        receipt: joi.string().required(),
        couponCode: joi.string().optional()
    });
    return schema.validate(data);
}