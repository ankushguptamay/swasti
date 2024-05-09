module.exports = (sequelize, DataTypes) => {
    const CampaignEmail = sequelize.define("campaignEmails", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        }
    })
    return CampaignEmail;
}