module.exports = (sequelize, DataTypes) => {
    const CourseContent = sequelize.define("courseContents", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
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
        creater: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        }
    }, {
        paranoid: true
    })
    return CourseContent;
}

// ForiegnKey
// courseId
// createrId