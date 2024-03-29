const joi = require('joi');

exports.courseCategoryValidation = (data) => {
    const schema = joi.object().keys({
        categoryName: joi.string().required()

    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.courseCouponValidation = (data) => {
    const schema = joi.object().keys({
        couponTitle: joi.string().required(),
        discountInPercent: joi.string().required(),
        validTill: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}
