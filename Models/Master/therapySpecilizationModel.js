module.exports = (sequelize, DataTypes) => {
    const TherapySpecilization = sequelize.define("therapySpecilizations", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        specilization: {
            type: DataTypes.STRING
        }
    })
    return TherapySpecilization;
}