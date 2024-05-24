const joi = require('joi');

exports.createBusiness = (data) => {
    const schema = joi.object().keys({
        businessName: joi.string().required(),
        pincode: joi.string().required(),
        block_building: joi.string().required(),
        street_colony: joi.string().required(),
        area: joi.string().required(),
        landmark: joi.string().optional(),
        city: joi.string().required(),
        state: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.createContact = (data) => {
    const schema = joi.object().keys({
        title: joi.string().required(),
        person: joi.string().required(),
        mobileNumber: joi.array().required(),
        whatsAppNumber: joi.array().optional(),
        landLineNumber: joi.array().optional(),
        email: joi.string().email().required().label('Email')
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

exports.createTiming = (data) => {
    const schema = joi.object().keys({
        isSun: joi.boolean().required(),
        isMon: joi.boolean().required(),
        isTue: joi.boolean().required(),
        isWed: joi.boolean().required(),
        isThu: joi.boolean().required(),
        isFri: joi.boolean().required(),
        isSat: joi.boolean().required(),
        openAt: joi.string().required(),
        closeAt: joi.string().required()
    }) // .options({ allowUnknown: true });
    return schema.validate(data);
}

