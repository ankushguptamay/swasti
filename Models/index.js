const dbConfig = require('../Config/db.Config.js');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};
const queryInterface = sequelize.getQueryInterface();
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Admin
db.admin = require('./Admin/adminModel.js')(sequelize, Sequelize);
db.emailCredential = require('./Admin/bravoEmailCredentialModel.js')(sequelize, Sequelize);

// Course
db.course_Student = require('./Course/JunctionTable/course_Student_JunctionModel.js')(sequelize, Sequelize);
db.course_Coupon = require('./Course/JunctionTable/course_Coupon_JunctionModel.js')(sequelize, Sequelize);
db.courseContent = require('./Course/courseContentModel.js')(sequelize, Sequelize);
db.courseAndContentFile = require('./Course/courseAndContentFileModel.js')(sequelize, Sequelize);
db.course = require('./Course/courseModel.js')(sequelize, Sequelize);
db.videos = require('./Course/videoModel.js')(sequelize, Sequelize);
db.contentHistory = require('./Course/CourseHistory/contentHistoryModel.js')(sequelize, Sequelize);
db.courseHistory = require('./Course/CourseHistory/courseHistoryModel.js')(sequelize, Sequelize);

// Master
db.coupon = require('./Master/couponModel.js')(sequelize, Sequelize);
db.courseCategory = require('./Master/courseCategoryModel.js')(sequelize, Sequelize);
db.courseDuration = require('./Master/courseDurationModel.js')(sequelize, Sequelize);
db.courseDurationType = require('./Master/courseDurationTypeModel.js')(sequelize, Sequelize);
db.courseType = require('./Master/courseTypeModel.js')(sequelize, Sequelize);
db.university_institute = require('./Master/university_institute_nameModel.js')(sequelize, Sequelize);

// Review
db.instructorReview = require('./Review/instructorReviewModel.js')(sequelize, Sequelize);
db.courseReview = require('./Review/courseReviewModel.js')(sequelize, Sequelize);

// Instructor
db.instructor = require('./User/Instructor/instructorModel.js')(sequelize, Sequelize);
db.insturctorQualification = require('./User/Instructor/insturctorQualificationModel.js')(sequelize, Sequelize);
db.instructorExperience = require('./User/Instructor/instructorExperienceModel.js')(sequelize, Sequelize);
db.emailOTP = require('./User/emailOTPModel.js')(sequelize, Sequelize);

// YogaStudio
db.yogaStudioBusiness = require('./YogaStudio/yogaStudioBusinessModel.js')(sequelize, Sequelize);
db.yogaStudioContact = require('./YogaStudio/yogaStudioContactModel.js')(sequelize, Sequelize);
db.yogaStudioImage = require('./YogaStudio/yogaStudioImageModel.js')(sequelize, Sequelize);
db.yogaStudioTiming = require('./YogaStudio/yogaStudioTimingModel.js')(sequelize, Sequelize);
db.ySBusinessHistory = require('./YogaStudio/UpdationAndHistory/ySBusinessHistoryModel.js')(sequelize, Sequelize);

//Home Tutor
db.homeTutor = require('./HomeTutor/homeTutorModel.js')(sequelize, Sequelize);
db.hTServiceArea = require('./HomeTutor/hTServiceAreaModel.js')(sequelize, Sequelize);
db.hTTimeSlote = require('./HomeTutor/hTTimeSloteModel.js')(sequelize, Sequelize);
db.hTImage = require('./HomeTutor/hTImageModel.js')(sequelize, Sequelize);
db.homeTutorHistory = require('./HomeTutor/homeTutorHistoryModel.js')(sequelize, Sequelize);

// Instructor History
db.instructorHistory = require('./User/Instructor/InstructorHistory/instructorHistoryModel.js')(sequelize, Sequelize);

// Student
db.student = require('./User/Student/studentModel.js')(sequelize, Sequelize);
db.studentProfile = require('./User/Student/studentProfileModel.js')(sequelize, Sequelize);

// Notification
db.createNotification = require('./createNotificationModel.js')(sequelize, Sequelize);
db.campaignEmail = require('./campaignEmailModel.js')(sequelize, Sequelize);
db.campaignEmailCredential = require('./campaignEmailCredentialsModel.js')(sequelize, Sequelize);

// Association
// Student's Association with profile
db.student.hasOne(db.studentProfile, { foreignKey: 'studentId', as: 'profile' });

// Instructor's Association with Qualification
db.instructor.hasMany(db.insturctorQualification, { foreignKey: 'instructorId', as: 'qualifications' });

// Instructor's Association with Experience
db.instructor.hasMany(db.instructorExperience, { foreignKey: 'instructorId', as: 'experience' });

// Instructor's Association with Instructor history
db.instructor.hasMany(db.instructorHistory, { foreignKey: 'instructorId', as: 'updateHistory' });

// Course's Association with course content
db.course.hasMany(db.courseContent, { foreignKey: 'courseId', as: 'contents' });
db.courseContent.belongsTo(db.course, { foreignKey: 'courseId', as: 'course' });

// Course's Association with coupon
db.course.hasMany(db.course_Coupon, { foreignKey: 'courseId', as: 'course_coupon' });
db.course_Coupon.belongsTo(db.course, { foreignKey: 'courseId', as: 'course' });

db.coupon.hasMany(db.course_Coupon, { foreignKey: 'couponId', as: 'course_coupon' });
db.course_Coupon.belongsTo(db.coupon, { foreignKey: 'couponId', as: 'coupon' });

// Course's Association with file
db.course.hasMany(db.courseAndContentFile, { foreignKey: 'courseId', as: 'files' });

// Content's Association with file
db.courseContent.hasMany(db.courseAndContentFile, { foreignKey: 'contentId', as: 'files' });

// Course's Association with Videos
db.course.hasMany(db.videos, { foreignKey: 'courseId', as: 'videos' });

// Content's Association with Videos
db.courseContent.hasMany(db.videos, { foreignKey: 'contentId', as: 'videos' });

// Course's Association with courseHistory
db.course.hasMany(db.courseHistory, { foreignKey: 'courseId', as: 'courseHistories' });

// Content's Association with contentHistory
db.courseContent.hasMany(db.contentHistory, { foreignKey: 'contentId', as: 'contentHistories' });

// Instructor Association with review
db.instructor.hasMany(db.instructorReview, { foreignKey: 'instructorId', as: 'review' });

// Course Association with courseReview
db.course.hasMany(db.courseReview, { foreignKey: 'courseId', as: 'review' });

// Student Association with courseReview
db.student.hasMany(db.courseReview, { foreignKey: 'reviewerId', as: 'review' });

// YogaStudio
db.yogaStudioBusiness.hasOne(db.yogaStudioContact, { foreignKey: 'businessId', as: 'contacts' });
db.yogaStudioBusiness.hasMany(db.yogaStudioTiming, { foreignKey: 'businessId', as: 'timings' });
db.yogaStudioBusiness.hasMany(db.yogaStudioImage, { foreignKey: 'businessId', as: 'images' });

db.yogaStudioBusiness.hasOne(db.ySBusinessHistory, { foreignKey: 'businessId', as: 'businessHistory' });

// Home Tutor
db.instructor.hasMany(db.homeTutor, { foreignKey: 'instructorId', as: 'homeTutors' });

db.homeTutor.hasMany(db.hTServiceArea, { foreignKey: 'homeTutorId', as: 'serviceAreas' });
db.hTServiceArea.belongsTo(db.homeTutor, { foreignKey: 'homeTutorId', as: 'homeTutors' });

db.homeTutor.hasMany(db.hTTimeSlote, { foreignKey: 'homeTutorId', as: 'timeSlotes' });
db.hTTimeSlote.belongsTo(db.homeTutor, { foreignKey: 'homeTutorId', as: 'homeTutors' });

db.homeTutor.hasMany(db.hTImage, { foreignKey: 'homeTutorId', as: 'images' });
db.hTImage.belongsTo(db.homeTutor, { foreignKey: 'homeTutorId', as: 'homeTutors' });

db.homeTutor.hasOne(db.homeTutorHistory, { foreignKey: 'homeTutorId', as: 'homeTutorHistories' });

// For Location
db.hTServiceArea.addScope('distance', (latitude, longitude, distance, unit = "km") => {
    const constant = unit == "km" ? 6371 : 3959;
    const haversine = `(
        ${constant} * acos(
            cos(radians(${latitude}))
            * cos(radians(latitude))
            * cos(radians(longitude) - radians(${longitude}))
            + sin(radians(${latitude})) * sin(radians(latitude))
        )
    )`;
    return {
        attributes: [
            [sequelize.literal(haversine), 'distance'],
        ],
        having: sequelize.literal(`distance <= ${distance}`)
    }
});

// This many to many relation auto deleteing table after create it.......?
// db.leadProfile.belongsToMany(
//     db.userInformation, {
//     through: "lead_To_User",
//     foreignKey: "leadProfileCode",
//     otherKey: "userInformationCode",
//     targetKey: "userCode",
//     sourceKey: "leadCode",
//     as: 'users'
// }
// );
// db.userInformation.belongsToMany(
//     db.leadProfile, {
//     through: "lead_To_User",
//     foreignKey: "userInformationCode",
//     otherKey: 'leadProfileCode',
//     targetKey: "leadCode",
//     sourceKey: "userCode",
//     as: "leads"
// }
// );

// db.emailCredential.findOne({
//     where: {
//         email: process.env.EMAIL
//     }
// }).then((res) => {
//     console.log(res);
//     if (!res) {
//         db.emailCredential.create({
//             email:process.env.EMAIL,
//             plateForm: "BREVO",
//             EMAIL_API_KEY: process.env.EMAIL_API_KEY
//         });
//     }
// }).catch((err) => { console.log(err) });

// queryInterface.addColumn("instructors", "latitude", {
//     type: DataTypes.FLOAT(10, 6)
// }).then((res) => { console.log("1 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("instructors", "longitude", {
//     type: DataTypes.FLOAT(10, 6)
// }).then((res) => { console.log("2 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("instructors", "isInstructor", {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
// }).then((res) => { console.log("3 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("instructors", "isHomeTutor", {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
// }).then((res) => { console.log("4 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("instructors", "isTherapist", {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
// }).then((res) => { console.log("5 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("instructors", "therapistTermAccepted", {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
// }).then((res) => { console.log("6 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("hTTimeSlots", "homeTutorTermAccepted", {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
// }).then((res) => { console.log("7 Added!") }).catch((err) => { console.log(err) });
// queryInterface.addColumn("instructors", "instructorTermAccepted", {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true
// }).then((res) => { console.log("8 Added!") }).catch((err) => { console.log(err) });

queryInterface.addColumn("instructorHistorys", "latitude", {
    type: DataTypes.FLOAT(10, 6)
}).then((res) => { console.log("1 Added!") }).catch((err) => { console.log(err) });
queryInterface.addColumn("instructorHistorys", "longitude", {
    type: DataTypes.FLOAT(10, 6)
}).then((res) => { console.log("2 Added!") }).catch((err) => { console.log(err) });

module.exports = db;
