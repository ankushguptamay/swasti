module.exports = (sequelize, DataTypes) => {
    const TherapyType = sequelize.define("therapyTypes", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        therapyType: {
            type: DataTypes.STRING
        }
    })
    return TherapyType;
}