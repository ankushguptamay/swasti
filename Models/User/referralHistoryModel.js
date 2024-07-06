module.exports = (sequelize, DataTypes) => {
    const ReferralHistory = sequelize.define("referralHistories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        chakraNumber: {
            type: DataTypes.INTEGER,
            validate: {
                isIn: [[1, 2, 3, 4, 5, 6, 7]]
            }
        },
        joinerName: {
            type: DataTypes.STRING
        },
        date: {
            type: DataTypes.STRING
        },
        joinerId: {
            type: DataTypes.STRING
        },
        ownerId: {
            type: DataTypes.STRING
        }
    })
    return ReferralHistory;
}