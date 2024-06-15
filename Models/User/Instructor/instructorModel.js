module.exports = (sequelize, DataTypes) => {
    const Instructor = sequelize.define("instructors", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        instructorCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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
        createdBy: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Self', 'Admin']]
            },
            defaultValue: 'Self'
        },
        imageOriginalName: {
            type: DataTypes.STRING
        },
        cloudinaryFileId: {
            type: DataTypes.STRING
        },
        imagePath: {
            type: DataTypes.STRING(1234)
        },
        imageFileName: {
            type: DataTypes.STRING(1234)
        },
        location: {
            type: DataTypes.STRING
        },
        latitude: {
            type: DataTypes.FLOAT(10, 6)
        },
        longitude: {
            type: DataTypes.FLOAT(10, 6)
        },
        bio: {
            type: DataTypes.STRING(1234)
        },
        socialMediaLink: {
            type: DataTypes.STRING(1234)
        },
        linkedIn: {
            type: DataTypes.STRING
        },
        twitter_x: {
            type: DataTypes.STRING
        },
        instagram: {
            type: DataTypes.STRING
        },
        facebook: {
            type: DataTypes.STRING
        },
        languages: {
            type: DataTypes.JSON
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY
        },
        isVerify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isInstructor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isHomeTutor: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isTherapist: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        therapistTermAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        homeTutorTermAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        instructorTermAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        ownYogaStudio: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        yogaStudioTermAccepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    })
    return Instructor;
}