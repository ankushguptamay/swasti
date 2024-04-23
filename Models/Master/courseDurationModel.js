module.exports = (sequelize, DataTypes) => {
    const CourseDuration = sequelize.define("courseDurations", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        courseDuration: {
            type: DataTypes.STRING
        }
    })
    return CourseDuration;
}