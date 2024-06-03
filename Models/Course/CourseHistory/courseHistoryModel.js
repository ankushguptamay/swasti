module.exports = (sequelize, DataTypes) => {
    const CourseUpdateHistory = sequelize.define("courseUpdateHistories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category: {
            type: DataTypes.STRING
        },
        coursePrice: {
            type: DataTypes.STRING
        },
        heading: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        level: {
            type: DataTypes.STRING
        },
        language: {
            type: DataTypes.STRING
        },
        courseName: {
            type: DataTypes.STRING
        },
        courseCode: {
            type: DataTypes.STRING,
            unique: true
        },
        duration: {
            type: DataTypes.STRING
        },
        teacherName: {
            type: DataTypes.STRING
        },
        introVideoLink: {
            type: DataTypes.STRING(1234)
        },
        creater: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        },
        createrId: {
            type: DataTypes.STRING
        },
        updationStatus: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        startingTime: {
            type: DataTypes.STRING
        },
        endingTime: {
            type: DataTypes.STRING
        },
        startingDate: {
            type: DataTypes.DATEONLY
        },
        certificationType: {
            type: DataTypes.STRING
        },
        certificationFromInstitute: {
            type: DataTypes.STRING
        },
    })
    return CourseUpdateHistory;
}

// courseId