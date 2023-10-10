module.exports = (sequelize, DataTypes) => {
    const CourseDiscount = sequelize.define("courseDiscount", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        discountTitle: {
            type: DataTypes.STRING
        },
        discountNumber:{
            type:DataTypes.TEXT
        },
        discountInPercent:{
            type:DataTypes.STRING
        }
    })
    return CourseDiscount;
}