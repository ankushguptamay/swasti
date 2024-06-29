module.exports = (sequelize, DataTypes) => {
    const Chakra = sequelize.define("chakras", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        chakraName: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown']]
            }
        },
        chakraNumber: {
            type: DataTypes.INTEGER,
            validate: {
                isIn: [[1, 2, 3, 4, 5, 6, 7]]
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        ownerId: {
            type: DataTypes.STRING
        }
    })
    return Chakra;
}