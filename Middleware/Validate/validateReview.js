const joi = require('joi');

exports.reviewValidation = (data) => {
    const schema = joi.object().keys({
        reviewerName: joi.string().required(),
        reviewerMessage: joi.string().required(),
        reviewStar: joi.string().required()

    });
    return schema.validate(data);
}