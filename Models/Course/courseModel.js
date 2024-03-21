module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("courses", {
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
        duration: {
            type: DataTypes.STRING
        },
        teacherName: {
            type: DataTypes.STRING
        },
        introVideoLink: {
            type: DataTypes.STRING(1234)
        },
        createrId: {
            type: DataTypes.STRING
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            },
            defaultValue: 'Pending'
        },
        certificationType: {
            type: DataTypes.STRING
        },
        certificationFromInstitute: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    })
    return Course;
}

// ForiegnKey
// instructorId