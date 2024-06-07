module.exports = (sequelize, DataTypes) => {
    const HTTimeSlot = sequelize.define("hTTimeSlots", {
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
            type: DataTypes.STRING,
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
    return HTTimeSlot;
}

// instructorId
// homeTutorId