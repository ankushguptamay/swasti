module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("courses", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        // category: {
        //     type: DataTypes.STRING
        // },
        // coursePrice: {
        //     type: DataTypes.STRING
        // },
        // heading:{
        //     type: DataTypes.STRING
        // },
        // description:{
        //     type: DataTypes.STRING
        // },
        // level:{
        //     type: DataTypes.STRING
        // },
        // language:{
        //     type: DataTypes.STRING
        // },
        // courseName:{
        //     type: DataTypes.STRING
        // },
        // courseImage:{
        //     type: DataTypes.TEXT
        // },
        // duration:{
        //     type: DataTypes.STRING
        // },
        // topic:{
        //     type: DataTypes.JSON 
        // },
        // teacherName:{
        //     type: DataTypes.STRING
        // },
        // teacherImage:{
        //     type: DataTypes.TEXT
        // },
        // coupen:{
        //     type: DataTypes.STRING
        // },
        // introVideoLink:{
        //     type: DataTypes.STRING
        // },
        createrId: {
            type: DataTypes.STRING
        },
        approvalStatus: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Panding', 'Approved', 'Rejected']]
            },
            defaultValue: 'Panding'
        }
    })
    return Course;
}