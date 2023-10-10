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
db.courseContent = require('./Admin/courseContentModel.js')(sequelize, Sequelize);
db.course = require('./Admin/courseModel.js')(sequelize, Sequelize);

// Employee
db.instructor = require('./User/Instructor/instructorModel.js')(sequelize, Sequelize);

// Student
db.student = require('./User/Student/studentModel.js')(sequelize, Sequelize);

// Association of course
db.course.hasMany(db.courseContent, { foreignKey: 'courseId', as: 'content' });
db.courseContent.belongsTo(db.course, { foreignKey: 'courseId', as: 'course' });

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
