module.exports = (sequelize, DataTypes) => {
    const CourseCategories = sequelize.define("courseCategories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category: {
            type: DataTypes.STRING
        },
        categoryNumber: {
            type: DataTypes.TEXT
        }
    })
    return CourseCategories;
}