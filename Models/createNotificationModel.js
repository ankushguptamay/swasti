module.exports = (sequelize, DataTypes) => {
    const CreateNotification = sequelize.define("createNotifications", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        notification: {
            type: DataTypes.STRING(1234)
        },
        creater: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        },
        createrId: {
            type: DataTypes.STRING
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        forWhom: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Student', 'Instructor', 'Both']]
            }
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
    return CreateNotification;
}