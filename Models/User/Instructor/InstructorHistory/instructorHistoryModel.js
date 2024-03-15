module.exports = (sequelize, DataTypes) => {
    const InstructorHistory = sequelize.define("instructorHistorys", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        phoneNumber: {
            type: DataTypes.STRING
        },
        instructorType: {
            type: DataTypes.STRING,
            validate: {
                isIn: {
                    args: [['Instructor', 'Teacher', 'Coach', 'Trainer']],
                    msg: "Must be Instructor, Teacher, Coach or Trainer!"
                }
            }
        },
        imageOriginalName: {
            type: DataTypes.STRING
        },
        imagePath: {
            type: DataTypes.STRING(1234)
        },
        ImageFileName: {
            type: DataTypes.STRING(1234)
        },
        location: {
            type: DataTypes.STRING
        },
        bio: {
            type: DataTypes.STRING(1234)
        },
        socialMediaLink: {
            type: DataTypes.STRING(1234)
        }
    }, {
        paranoid: true
    })
    return InstructorHistory;
}

// ForiegnKey
// instructorId