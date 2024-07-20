module.exports = (sequelize, DataTypes) => {
    const AdminBanner = sequelize.define("adminBanners", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        originalName: {
            type: DataTypes.STRING
        },
        path: {
            type: DataTypes.STRING(1234)
        },
        fileName: {
            type: DataTypes.STRING(1234)
        }
    })
    return AdminBanner;
}