module.exports = (sequelize, DataTypes) => {
    const CourseCategories = sequelize.define("courseCategories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        categoryName: {
            type: DataTypes.STRING
        },
        courseCategoryNumber: {
            type: DataTypes.TEXT
        }
    })
    return CourseCategories;
}