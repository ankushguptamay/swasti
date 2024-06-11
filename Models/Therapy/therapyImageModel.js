module.exports = (sequelize, DataTypes) => {
    const TherayImages = sequelize.define("therapyImages", {
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
    return TherayImages;
}

// ForiegnKey
// therapyId