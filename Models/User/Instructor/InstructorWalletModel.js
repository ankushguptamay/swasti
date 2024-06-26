module.exports = (sequelize, DataTypes) => {
    const InstructorWallet = sequelize.define("instructorWallets", {
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
    return InstructorWallet;
}

// foriegn key
// instructorId