module.exports = (sequelize, DataTypes) => {
    const InstructorExperience = sequelize.define("instructorExperiences", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        workHistory: {
            type: DataTypes.STRING
        },
        skills: {
            type: DataTypes.JSON
        },
        role: {
            type: DataTypes.STRING
        },
        organization: {
            type: DataTypes.STRING
        },
        joinDate: {
            type: DataTypes.DATEONLY
        },
        department: {
            type: DataTypes.STRING
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
    return InstructorExperience;
}