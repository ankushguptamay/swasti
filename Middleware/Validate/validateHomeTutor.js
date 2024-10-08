const joi = require("joi");
const pattern =
  "/(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]{8,20}/";

exports.homeTutorValidation = (data) => {
  const schema = joi.object().keys({
    yogaFor: joi.array().required(),
    homeTutorName: joi.string().required(),
    isPrivateSO: joi.boolean().required(),
    isGroupSO: joi.boolean().required(),
    language: joi.array().required(),
    privateSessionPrice_Day: joi.string().optional(),
    privateSessionPrice_Month: joi.string().optional(),
    groupSessionPrice_Day: joi.string().optional(),
    groupSessionPrice_Month: joi.string().optional(),
    specilization: joi.array().required(),
    instructorBio: joi.string().required(),
  }); // .options({ allowUnknown: true });
  return schema.validate(data);
};

exports.hTutorLocationValidation = (data) => {
  const schema = joi.object().keys({
    locationName: joi.string().required(),
    latitude: joi.string().required(),
    longitude: joi.string().required(),
    radius: joi.number().required(),
    unit: joi.string().valid("km", "m").required(),
  }); // .options({ allowUnknown: true });
  return schema.validate(data);
};

exports.hTutorTimeSloteValidation = (data) => {
  const schema = joi.object().keys({
    startTime: joi.string().required(),
    startDate: joi.string().required(),
    endDate: joi.string().required(),
    timeDurationInMin: joi.number().required(),
    serviceType: joi.string().valid("Group", "Private").required(),
    serviceAreaId: joi.string().optional(),
    newServiceArea: joi.object().optional(),
    noOfPeople: joi.number().required(),
  }); // .options({ allowUnknown: true });
  return schema.validate(data);
};

// data:{"startTime":["11:00PM","12:00PM"],"startDate":"2024-09-07","endDate":"2024-09-12","timeDurationInMin":60,
//   "serviceType":"Group","newServiceArea":{"locationName":"Delhi","latitude":"389077489","longitude":"13213231","radius":3,"unit":"m"},"noOfPeople":5}

exports.bookHTValidation = (data) => {
  const schema = joi.object().keys({
    amount: joi.string().required(),
    currency: joi.string().required(),
    receipt: joi.string().required(),
    couponCode: joi.string().optional(),
    timeSloteId: joi.string().required(),
    noOfBooking: joi.string().required(),
    userPreferedLanguage: joi.string().required(),
  });
  return schema.validate(data);
};

exports.getHomeTutorForUserValidation = (data) => {
  const schema = joi
    .object()
    .keys({
      isPersonal: joi.boolean().optional(),
      isGroup: joi.boolean().optional(),
      language: joi.array().optional(),
      latitude: joi.string().optional(),
      longitude: joi.string().optional(),
      price: joi.string().optional(),
      page: joi.number().optional(),
      limit: joi.number().optional(),
      search: joi.string().optional(),
    })
    .options({ allowUnknown: true });
  return schema.validate(data);
};
