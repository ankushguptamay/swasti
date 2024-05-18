module.exports = (sequelize, DataTypes) => {
    const CourseAndContentFile = sequelize.define("courseAndContentFiles", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        titleOrOriginalName: {
            type: DataTypes.STRING
        },
        cloudinaryFileId: {
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
                isIn: [['TeacherImage', 'CourseImage', 'ContentFile']]
            },
            defaultValue: 'ContentFile'
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        createrId: {
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
        creater: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        }
    }, {
        paranoid: true
    })
    return CourseAndContentFile;
}

// ForiegnKey
// courseId
// createrId
// contentId