module.exports = (sequelize, DataTypes) => {
    const YogaStudioTime = sequelize.define("yogaStudioTimes", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        isSun: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isMon: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isTue: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isWed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isThu: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isFri: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isSat: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        openAt: {
            type: DataTypes.STRING
        },
        closeAt: {
            type: DataTypes.STRING
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Student', 'ByUpdation']]
            }
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
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
        },
        anyUpdateRequest: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        paranoid: true
    })
    return YogaStudioTime;
}