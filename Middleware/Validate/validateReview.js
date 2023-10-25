const joi = require('joi');

exports.instructorReviewValidation = (data) => {
    const schema = joi.object().keys({
        reviewerName: joi.string().required(),
        reviewerMessage: joi.string().required(),
        reviewStar: joi.string().required()

    });
    return schema.validate(data);
}

exports.courseReviewValidation = (data) => {
    const schema = joi.object().keys({
        discountTitle: joi.string().required(),
        discountInPercent: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}
