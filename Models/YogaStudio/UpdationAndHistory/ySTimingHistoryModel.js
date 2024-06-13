module.exports = (sequelize, DataTypes) => {
    const YSTimeHistory = sequelize.define("ySTimehistorys", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        isSun: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isMon: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isTue: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isWed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isThu: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isFri: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isSat: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        openAt: {
            type: DataTypes.STRING
        },
        closeAt: {
            type: DataTypes.STRING
        },
        updationStatus: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        updatedBy: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        }
    })
    return YSTimeHistory;
}