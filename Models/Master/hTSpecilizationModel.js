module.exports = (sequelize, DataTypes) => {
    const HTSpecilization = sequelize.define("hTSpecilizations", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        specilization: {
            type: DataTypes.STRING
        }
    })
    return HTSpecilization;
}