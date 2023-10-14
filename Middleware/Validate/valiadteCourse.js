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

exports.contentValidation = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required()
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