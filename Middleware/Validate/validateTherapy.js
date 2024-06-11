const joi = require('joi');
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.therapyValidation = (data) => {
    const schema = joi.object().keys({
        therapistName: joi.string().required(),
        studioLocation: joi.string().required(),
        language: joi.array().required(),
        specilization: joi.array().required(),
        instructorBio: joi.string().required(),
        latitude: joi.string().required(),
        longitude: joi.string().required(),
        pincode: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.therapyLocationValidation = (data) => {
    const schema = joi.object().keys({
        locationName: joi.string().required(),
        latitude: joi.string().required(),
        longitude: joi.string().required(),
        radius: joi.number().required(),
        unit: joi.string().valid('km', 'm').required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.therapyTimeSloteValidation = (data) => {
    const schema = joi.object().keys({
        date: joi.string().required(),
        time: joi.array().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}
exports.therapyTypeOfferedValidation = (data) => {
    const schema = joi.object().keys({
        therapyName: joi.string().required(),
        isHomeSO: joi.boolean().required(),
        isStudioSO: joi.boolean().required(),
        isHomePrivateClass: joi.boolean().required(),
        isHomeGroupClass: joi.boolean().required(),
        isStudioPrivateClass: joi.boolean().required(),
        isStudioGroupClass: joi.boolean().required(),
        home_PrivateSessionPrice_Day: joi.string().optional(),
        home_privateSessionPrice_Month: joi.string().optional(),
        home_groupSessionPrice_Day: joi.string().optional(),
        home_groupSessionPrice_Month: joi.string().optional(),
        studio_PrivateSessionPrice_Day: joi.string().optional(),
        studio_privateSessionPrice_Month: joi.string().optional(),
        studio_groupSessionPrice_Day: joi.string().optional(),
        studio_groupSessionPrice_Month: joi.string().optional(),
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}