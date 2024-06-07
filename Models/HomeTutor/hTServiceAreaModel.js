module.exports = (sequelize, DataTypes) => {
    const HTServiceArea = sequelize.define("hTServiceAreas", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        locationName: {
            type: DataTypes.STRING
        },
        latitude: {
            type: DataTypes.FLOAT(10, 6)
        },
        longitude: {
            type: DataTypes.FLOAT(10, 6)
        },
        pincode: {
            type: DataTypes.STRING
        },
        radius: {
            type: DataTypes.INTEGER
        },
        unit: {
            type: DataTypes.STRING
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
    return HTServiceArea;
}

// instructorId
// homeTutorId