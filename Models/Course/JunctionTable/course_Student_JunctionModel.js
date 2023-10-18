module.exports = (sequelize, DataTypes) => {
    const Course_Student_Junctions = sequelize.define("Course_Student_Junctions", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        validTill: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    })
    return Course_Student_Junctions;
}

// Foriegnkey
// courseId
// studentId