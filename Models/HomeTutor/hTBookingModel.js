module.exports = (sequelize, DataTypes) => {
    const HTBooking = sequelize.define("hTBookings", {
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
        userName: {
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
        homeTutorId: {
            type: DataTypes.STRING
        },
        timeSloteId: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        },
        noOfBooking: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        paranoid: true
    });
    return HTBooking;
};