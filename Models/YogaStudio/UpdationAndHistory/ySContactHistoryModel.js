module.exports = (sequelize, DataTypes) => {
    const YSContactHistory = sequelize.define("ySContactHistorys", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        person: {
            type: DataTypes.STRING
        },
        mobileNumber: {
            type: DataTypes.JSON
        },
        whatsAppNumber: {
            type: DataTypes.JSON
        },
        landLineNumber: {
            type: DataTypes.JSON
        },
        email: {
            type: DataTypes.JSON
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
    return YSContactHistory;
}