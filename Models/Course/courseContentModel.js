module.exports = (sequelize, DataTypes) => {
    const CourseContent = sequelize.define("courseContents", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING
        },
        createrId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    })
    return CourseContent;
}

// ForiegnKey
// courseId
// createrId