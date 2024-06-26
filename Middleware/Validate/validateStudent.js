const joi = require('joi');
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.registerStudent = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).optional(),
        email: joi.string().email().required().label('Email'),
        phoneNumber: joi.string().length(10).pattern(/^[0-9]+$/).optional(),
        referralCode: joi.string().optional()
    });
    return schema.validate(data);
}

exports.verifyOTPByLandingPage = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        phoneNumber: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        location: joi.string().min(3).max(30).optional(),
        otp: joi.string().length(6).required()
    });
    return schema.validate(data);
}

exports.registerByLandingPage = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        phoneNumber: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        location: joi.string().min(3).max(30).optional()
    })//.options({ allowUnknown: true });
    return schema.validate(data);
}