module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define("students", {
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
        studentCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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
    return Student;
}