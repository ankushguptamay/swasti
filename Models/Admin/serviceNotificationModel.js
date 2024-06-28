module.exports = (sequelize, DataTypes) => {
    const ServiceNotification = sequelize.define("serviceNotifications", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        notification: {
            type: DataTypes.STRING(1234)
        },
        instructorServices: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Course', 'HomeTutor', 'Theray', 'YogaStudio']]
            }
        },
        serviceId: {
            type: DataTypes.STRING
        },
        response: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Approved', 'Rejected']]
            }
        }
    })
    return ServiceNotification;
}

// instructorId