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

// Course
db.course_Student_Junction = require('./Course/JunctionTable/course_Student_JunctionModel.js')(sequelize, Sequelize);
db.course_Discount_Junction = require('./Course/JunctionTable/Course_Discount_JunctionModel.js')(sequelize, Sequelize);
db.courseContent = require('./Course/courseContentModel.js')(sequelize, Sequelize);
db.courseAndContentFile = require('./Course/courseAndContentFileModel.js')(sequelize, Sequelize);
db.course = require('./Course/courseModel.js')(sequelize, Sequelize);

// Master
db.discount = require('./Master/discountModel.js')(sequelize, Sequelize);
db.courseCategory = require('./Master/courseCategoryModel.js')(sequelize, Sequelize);

// Employee
db.instructor = require('./User/Instructor/instructorModel.js')(sequelize, Sequelize);
db.instructorProfile = require('./User/Instructor/insturctorProfileModel.js')(sequelize, Sequelize);

// Student
db.student = require('./User/Student/studentModel.js')(sequelize, Sequelize);
db.studentProfile = require('./User/Student/studentProfileModel.js')(sequelize, Sequelize);

// Association
// Student's Association with profile
db.student.hasOne(db.studentProfile, { foreignKey: 'studentId', as: 'profile' });

// Instructor's Association with profile
db.instructor.hasOne(db.instructorProfile, { foreignKey: 'instructorId', as: 'profile' });

// Course's Association with course content
db.course.hasMany(db.courseContent, { foreignKey: 'courseId', as: 'contents' });
db.courseContent.belongsTo(db.course, { foreignKey: 'courseId', as: 'course' });

// Course's Association with discount
db.course.hasMany(db.course_Discount_Junction, { foreignKey: 'courseId', as: 'course_Discount_Junction' });
db.course_Discount_Junction.belongsTo(db.course, { foreignKey: 'courseId', as: 'course' });

db.discount.hasMany(db.course_Discount_Junction, { foreignKey: 'discountId', as: 'course_Discount_Junction' });
db.course_Discount_Junction.belongsTo(db.discount, { foreignKey: 'discountId', as: 'discount' });

// Course's Association with file
db.course.hasMany(db.courseAndContentFile, { foreignKey: 'courseId', as: 'files' });

// Content's Association with file
db.courseContent.hasMany(db.courseAndContentFile, { foreignKey: 'contentId', as: 'files' });

// Course's Association with student
db.course.hasMany(db.course_Student_Junction, { foreignKey: 'courseId', as: 'course_Student_Junction' });
db.course_Student_Junction.belongsTo(db.course, { foreignKey: 'courseId', as: 'course' });

db.student.hasMany(db.course_Student_Junction, { foreignKey: 'studentId', as: 'course_Student_Junction' });
db.course_Student_Junction.belongsTo(db.student, { foreignKey: 'studentId', as: 'student' });

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

module.exports = db;
