module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define("coupons", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        couponTitle: {
            type: DataTypes.STRING
        },
        couponNumber: {
            type: DataTypes.STRING
        },
        discountInPercent: {
            type: DataTypes.STRING
        },
        creater: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        },
        createrId: {
            type: DataTypes.STRING
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            },
            defaultValue: 'Pending'
        },
        validTill: {
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
    return Coupon;
}

// ForiegnKey
// createrId