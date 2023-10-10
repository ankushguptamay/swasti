const joi = require('joi');
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.registerStudent = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        phoneNumber: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(8)
    }).options({ allowUnknown: true });
    return schema.validate(data);
}

exports.loginStudent = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        password: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(8)
    });
    return schema.validate(data);
}

exports.changePassword = (data) => {
    const schema = joi.object().keys({
        currentPassword: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(8),
        newPassword: joi.string()
            // .regex(RegExp(pattern))
            .required()
            .min(8)
            .max(8)
    })//.options({ allowUnknown: true });
    return schema.validate(data);
}
