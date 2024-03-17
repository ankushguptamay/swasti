const joi = require('joi');
const pattern = "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.loginInstructor = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email')
    });
    return schema.validate(data);
}

exports.registerInstructor = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().email().required().label('Email'),
        phoneNumber: joi.string().length(10).pattern(/^[0-9]+$/).required(),
        instructorType: joi.string().valid('Instructor', 'Teacher', 'Coach', 'Trainer').required()
    });
    return schema.validate(data);
}

exports.updateInstructor = (data) => {
    const schema = joi.object().keys({
        name: joi.string().min(3).max(30).required(),
        location: joi.string().required(),
        bio: joi.string().max(1000).required(),
        socialMediaLink: joi.string().optional(),
        facebook: joi.string().optional(),
        instagram: joi.string().optional(),
        linkedIn: joi.string().optional(),
        twitter_x: joi.string().optional(),
        languages: joi.array().required(),
        dateOfBirth: joi.string().required(),
    })//.options({ allowUnknown: true });
    return schema.validate(data);
}

exports.addQualification = (data) => {
    const schema = joi.object().keys({
        courseType: joi.string().required(),
        course: joi.string().required(),
        university_institute_name: joi.string().required(),
        year: joi.string().required(),
        marksType: joi.string().required(),
        marks: joi.string().required(),
        certificationNumber: joi.string().required()
    })//.options({ allowUnknown: true });
    return schema.validate(data);
}

exports.verifyOTP = (data) => {
    const schema = joi.object().keys({
        email: joi.string().email().required().label('Email'),
        otp: joi.string().length(6).required(),
    });
    return schema.validate(data);
}

exports.changeQualificationStatus = (data) => {
    const schema = joi.object().keys({
        approvalStatusByAdmin: joi.string().valid('Pending', 'Approved', 'Rejected').required()
    });
    return schema.validate(data);
}