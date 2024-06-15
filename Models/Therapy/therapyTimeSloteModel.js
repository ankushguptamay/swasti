module.exports = (sequelize, DataTypes) => {
    const TherapyTimeSlot = sequelize.define("therapyTimeSlots", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATEONLY
        },
        time: {
            type: DataTypes.STRING
        },
        isBooked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        password: {
            type: DataTypes.INTEGER,
        },
        appointmentStatus: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Active', 'Deactivate']]
            },
            defaultValue: "Active"
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
    return TherapyTimeSlot;
}

// instructorId
// therapyId