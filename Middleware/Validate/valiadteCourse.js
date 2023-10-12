const joi = require('joi');

exports.courseValidation = (data) => {
    const schema = joi.object().keys({
        category: joi.string().required(),
        coursePrice: joi.string().required(),
        heading: joi.string().required(),
        description: joi.string().required(),
        level: joi.string().required(),
        language: joi.string().required(),
        courseName: joi.string().required(),
        duration: joi.string().required(),
        introVideoLink: joi.string().required(),
        teacherName: joi.string().required()

    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}