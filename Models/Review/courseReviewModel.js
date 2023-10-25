module.exports = (sequelize, DataTypes) => {
    const CourseReview = sequelize.define("courseReview", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        reviewerName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reviewMessage: {
            type: DataTypes.STRING(1234),
            allowNull: false
        },
        reviewStar: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })
    return CourseReview;
}

// ForiegnKey
// courseId
// reviewerId