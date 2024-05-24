module.exports = (sequelize, DataTypes) => {
    const YogaStudioContact = sequelize.define("yogaStudioContacts", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        person: {
            type: DataTypes.STRING
        },
        mobileNumber: {
            type: DataTypes.JSON
        },
        whatsAppNumber: {
            type: DataTypes.JSON
        },
        landLineNumber: {
            type: DataTypes.JSON
        },
        email: {
            type: DataTypes.JSON
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
    return YogaStudioContact;
}