module.exports = (sequelize, DataTypes) => {
    const InstructorQualification = sequelize.define("instructorQualification", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        courseType: {
            type: DataTypes.STRING
        },
        course: {
            type: DataTypes.STRING
        },
        university_institute_name: {
            type: DataTypes.STRING
        },
        year: {
            type: DataTypes.STRING
        },
        marksType: {
            type: DataTypes.STRING
        },
        marks: {
            type: DataTypes.STRING
        },
        certificationNumber: {
            type: DataTypes.STRING
        },
        documentOriginalName: {
            type: DataTypes.STRING
        },
        documentPath: {
            type: DataTypes.STRING(1234)
        },
        documentFileName: {
            type: DataTypes.STRING(1234)
        },
        approvalStatusByAdmin: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            },
            defaultValue: 'Pending'
        },
        deletedThrough: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Admin', 'Instructor', 'ByUpdation']]
            }
        }
    }, {
        paranoid: true
    })
    return InstructorQualification;
}

// ForiegnKey
// instructorId