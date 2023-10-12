module.exports = (sequelize, DataTypes) => {
    const CourseContent = sequelize.define("courseContents", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        titleOrOriginalName: {
            type: DataTypes.STRING
        },
        linkOrPath: {
            type: DataTypes.STRING(1234)
        },
        mimeType: {
            type: DataTypes.STRING
        },
        fileName: {
            type: DataTypes.STRING(1234)
        },
        fieldName: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['TeacherImage', 'CourseImage', 'CourseContent']]
            },
            defaultValue: 'ContentFile'
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            },
            defaultValue: 'Pending'
        },
        createrId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    })
    return CourseContent;
}

// ForiegnKey
// courseId
// createrId