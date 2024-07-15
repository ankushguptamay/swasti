module.exports = (sequelize, DataTypes) => {
    const IKYC = sequelize.define("iKYCS", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        aadharNumber: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING(1234)
        },
        isVerify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    })
    return IKYC;
}

// foriegn key
// instructorId