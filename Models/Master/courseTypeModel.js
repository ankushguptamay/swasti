module.exports = (sequelize, DataTypes) => {
    const CourseType = sequelize.define("courseTypes", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        courseType: {
            type: DataTypes.STRING
        }
    })
    return CourseType;
}