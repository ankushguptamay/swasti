module.exports = (sequelize, DataTypes) => {
    const StudentWallet = sequelize.define("studentWallets", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    })
    return StudentWallet;
}

// foriegn key
// studentId