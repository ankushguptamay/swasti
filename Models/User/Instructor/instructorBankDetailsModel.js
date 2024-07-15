module.exports = (sequelize, DataTypes) => {
    const IBankDetail = sequelize.define("iBankDetails", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        bankName: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        accountNumber: {
            type: DataTypes.STRING
        },
        IFSCCode: {
            type: DataTypes.STRING
        },
        isVerify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        paranoid: true
    })
    return IBankDetail;
}

// foriegn key
// instructorId