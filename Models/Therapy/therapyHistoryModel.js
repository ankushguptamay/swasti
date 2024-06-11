module.exports = (sequelize, DataTypes) => {
    const TherapyHistory = sequelize.define("therapyHistories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        therapistName: {
            type: DataTypes.STRING
        },
        language: {
            type: DataTypes.JSON
        },
        specilization: {
            type: DataTypes.JSON
        },
        instructorBio: {
            type: DataTypes.STRING(1234)
        },
        studioLocation: {
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
        updatedBy: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        },
        updationStatus: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        }
    })
    return TherapyHistory;
}

// therapyId