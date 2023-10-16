module.exports = (sequelize, DataTypes) => {
    const Course_Discount_Junctions = sequelize.define("Course_Discount_Junctions", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        discountTitle: {
            type: DataTypes.STRING
        },
        discountNumber: {
            type: DataTypes.TEXT
        },
        discountInPercent: {
            type: DataTypes.STRING
        }
    })
    return Course_Discount_Junctions;
}

// Foriegnkey
// courseId
// discountId