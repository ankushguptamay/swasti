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
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        serviceType: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Group', 'Private']]
            },
            defaultValue: "Private"
        },
        noOfPeople: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        password: {
            type: DataTypes.INTEGER,
        },
        sloteCode: {
            type: DataTypes.STRING
        },
        userPreferedLanguage: {
            type: DataTypes.STRING
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