const joi = require('joi');
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.homeTutorValidation = (data) => {
    const schema = joi.object().keys({
        yogaFor: joi.array().required(),
        homeTutorName: joi.string().required(),
        serviceOffered: joi.array().required(),
        language: joi.array().required(),
        privateSessionPrice_Day: joi.string().optional(),
        privateSessionPrice_Month: joi.string().optional(),
        groupSessionPrice_Day: joi.string().optional(),
        groupSessionPrice_Month: joi.string().optional(),
        specilization: joi.array().required(),
        instructorBio: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.hTutorLocationValidation = (data) => {
    const schema = joi.object().keys({
        locationName: joi.string().required(),
        latitude: joi.string().required(),
        longitude: joi.string().required(),
        radius: joi.number().required(),
        unit: joi.string().valid('km', 'm').required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.hTutorTimeSloteValidation = (data) => {
    const schema = joi.object().keys({
        date: joi.string().required(),
        time: joi.array().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}