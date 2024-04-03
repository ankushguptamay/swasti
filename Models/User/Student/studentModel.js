module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define("students", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phoneNumber: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.STRING(1234)
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
        }
    }, {
        paranoid: true
    })
    return Student;
}