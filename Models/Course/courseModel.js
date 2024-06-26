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
            type: DataTypes.STRING,
            unique: true
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
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        certificationType: {
            type: DataTypes.STRING
        },
        certificationFromInstitute: {
            type: DataTypes.STRING
        },
        isPublish: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor', 'ByUpdation']]
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
        }
    }, {
        paranoid: true
    })
    return Course;
}

// ForiegnKey
// instructorId