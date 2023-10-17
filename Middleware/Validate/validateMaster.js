const joi = require('joi');

exports.courseCategoryValidation = (data) => {
    const schema = joi.object().keys({
        categoryName: joi.string().required()

    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.courseDiscountValidation = (data) => {
    const schema = joi.object().keys({
        discountTitle: joi.string().required(),
        discountInPercent: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}
