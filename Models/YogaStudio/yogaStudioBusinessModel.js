module.exports = (sequelize, DataTypes) => {
    const YogaStudioBusiness = sequelize.define("yogaStudioBusinesses", {
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
        latitude: {
            type: DataTypes.FLOAT(10, 6)
        },
        longitude: {
            type: DataTypes.FLOAT(10, 6)
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
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor', 'ByUpdation']]
            }
        },
        isPublish: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        anyUpdateRequest: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        paranoid: true
    })
    return YogaStudioBusiness;
}