module.exports = (sequelize, DataTypes) => {
  const Course_Duration_Type = sequelize.define("course_duration_types", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseType: {
      type: DataTypes.STRING,
    },
    courseName: {
      type: DataTypes.STRING,
    },
    courseDuration: {
      type: DataTypes.STRING,
    }
  });
  return Course_Duration_Type;
};
