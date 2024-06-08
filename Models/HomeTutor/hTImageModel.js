module.exports = (sequelize, DataTypes) => {
    const HTutorImages = sequelize.define("hTutorImages", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        cloudinaryFileId: {
            type: DataTypes.STRING
        },
        originalName: {
            type: DataTypes.STRING
        },
        path: {
            type: DataTypes.STRING(1234)
        },
        fileName: {
            type: DataTypes.STRING(1234)
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor', 'ByUpdation']]
            }
        }
    }, {
        paranoid: true
    })
    return HTutorImages;
}

// ForiegnKey
// instructorId
// homeTutorId