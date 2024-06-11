module.exports = (sequelize, DataTypes) => {
    const HomeTutorHistory = sequelize.define("homeTutorHistories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        homeTutorName: {
            type: DataTypes.STRING
        },
        serviceOffered: {
            type: DataTypes.JSON
        },
        yogaFor: {
            type: DataTypes.JSON // Children, parents
        },
        language: {
            type: DataTypes.JSON
        },
        privateSessionPrice_Day: {
            type: DataTypes.STRING
        },
        privateSessionPrice_Month: {
            type: DataTypes.STRING
        },
        groupSessionPrice_Day: {
            type: DataTypes.STRING
        },
        groupSessionPrice_Month: {
            type: DataTypes.STRING
        },
        specilization: {
            type: DataTypes.JSON
        },
        instructorBio: {
            type: DataTypes.STRING(1234)
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
    return HomeTutorHistory;
}

// homeTutorId