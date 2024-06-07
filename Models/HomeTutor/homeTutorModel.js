module.exports = (sequelize, DataTypes) => {
    const HomeTutor = sequelize.define("homeTutors", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        serviceOffered: {
            type: DataTypes.JSON
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
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        },
        isPublish: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        anyUpdateRequest: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        paranoid: true
    })
    return HomeTutor;
}