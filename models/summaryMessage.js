module.exports = function(sequelize, DataTypes) {
    const SummaryMessage = sequelize.define("SummaryMessage", {
        messageId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sheetId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });
    return SummaryMessage;
};