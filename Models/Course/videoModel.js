module.exports = (sequelize, DataTypes) => {
    const Video = sequelize.define("videos", {
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
        approvalStatusByAdmin: {
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
        modeOfVideo: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Live', 'Record']]
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
        createrId: {
            type: DataTypes.STRING
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
    return Video;
}

// ForiegnKey
// courseId
// createrId
// contentId