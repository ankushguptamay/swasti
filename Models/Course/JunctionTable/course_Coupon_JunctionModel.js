module.exports = (sequelize, DataTypes) => {
    const Course_Coupon_Junctions = sequelize.define("Course_coupon_junctions", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
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
    return Course_Coupon_Junctions;
}

// Foriegnkey
// courseId
// couponId