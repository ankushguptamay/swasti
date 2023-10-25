module.exports = (sequelize, DataTypes) => {
    const InstructorReview = sequelize.define("instructorReview", {
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
        },
        reviewerId: {
            type: DataTypes.STRING
        }
    })
    return InstructorReview;
}

// ForiegnKey
// instructorId