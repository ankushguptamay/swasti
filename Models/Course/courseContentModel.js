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
            },
            defaultValue: 'Pending'
        },
        isPublish: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    })
    return CourseContent;
}

// ForiegnKey
// courseId
// createrId