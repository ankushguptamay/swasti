module.exports = (sequelize, DataTypes) => {
    const EmailOTP = sequelize.define("emailOTPs", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        otp: {
            type: DataTypes.INTEGER,
        },
        vallidTill: {
            type: DataTypes.STRING
        },
        receiverId: {
            type: DataTypes.STRING
        }
    })
    return EmailOTP;
}