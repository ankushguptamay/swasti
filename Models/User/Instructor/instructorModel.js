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
        password: {
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
                    args:  [['Instructor', 'Teacher', 'Coach', 'Trainer']],
                    msg: "Must Instructor, Teacher, Coach or Trainer!"
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
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    })
    return Instructor;
}