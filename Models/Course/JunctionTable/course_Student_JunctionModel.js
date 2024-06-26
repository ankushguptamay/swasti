module.exports = (sequelize, DataTypes) => {
    const User_Course = sequelize.define("user_courses", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        amount: {
            type: DataTypes.STRING
        },
        currency: {
            type: DataTypes.STRING
        },
        studentName: {
            type: DataTypes.STRING
        },
        receipt: {
            type: DataTypes.STRING
        },
        razorpayOrderId: {
            type: DataTypes.STRING
        },
        razorpayPaymentId: {
            type: DataTypes.STRING
        },
        razorpayTime: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Created', 'Paid', 'Failed']]
            }
        },
        verify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        couponCode: {
            type: DataTypes.STRING
        },
        courseId: {
            type: DataTypes.STRING
        },
        studentId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return User_Course;
};