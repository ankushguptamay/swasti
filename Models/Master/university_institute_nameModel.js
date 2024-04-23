module.exports = (sequelize, DataTypes) => {
    const University_Institute = sequelize.define("university_institutes", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        university_institute_name: {
            type: DataTypes.STRING
        }
    })
    return University_Institute;
}