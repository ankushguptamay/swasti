module.exports = (sequelize, DataTypes) => {
    const TherapyOffered = sequelize.define("therapyOffereds", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        therapyName: {
            type: DataTypes.STRING
        },
        isHomeSO: {
            type: DataTypes.BOOLEAN
        },
        isStudioSO: {
            type: DataTypes.BOOLEAN
        },
        isHomePrivateClass: {
            type: DataTypes.BOOLEAN
        },
        isHomeGroupClass: {
            type: DataTypes.BOOLEAN
        },
        isStudioPrivateClass: {
            type: DataTypes.BOOLEAN
        },
        isStudioGroupClass: {
            type: DataTypes.BOOLEAN
        },
        home_PrivateSessionPrice_Day: {
            type: DataTypes.STRING
        },
        home_privateSessionPrice_Month: {
            type: DataTypes.STRING
        },
        home_groupSessionPrice_Day: {
            type: DataTypes.STRING
        },
        home_groupSessionPrice_Month: {
            type: DataTypes.STRING
        },
        studio_PrivateSessionPrice_Day: {
            type: DataTypes.STRING
        },
        studio_privateSessionPrice_Month: {
            type: DataTypes.STRING
        },
        studio_groupSessionPrice_Day: {
            type: DataTypes.STRING
        },
        studio_groupSessionPrice_Month: {
            type: DataTypes.STRING
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        }
    }, {
        paranoid: true
    })
    return TherapyOffered;
}

//therapyId