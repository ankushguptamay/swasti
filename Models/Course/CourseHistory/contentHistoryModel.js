module.exports = (sequelize, DataTypes) => {
    const ContentUpdateHistory = sequelize.define("contentUpdateHistory", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        createrId: {
            type: DataTypes.STRING
        },
        updationStatus: {
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
        }
    })
    return ContentUpdateHistory;
}

// contentId