module.exports = (sequelize, DataTypes) => {
    const YSBusinessHistory = sequelize.define("ySBusinessHistories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        businessName: {
            type: DataTypes.STRING
        },
        pincode: {
            type: DataTypes.STRING
        },
        block_building: {
            type: DataTypes.STRING
        },
        street_colony: {
            type: DataTypes.STRING
        },
        area: {
            type: DataTypes.STRING
        },
        landmark: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        },
        updationStatus: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Student', 'ByUpdation']]
            }
        },
        creater: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor']]
            }
        },
        createrId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    })
    return YSBusinessHistory;
}