const foreignKey = {
  allowNull: false
};

module.exports = function(sequelize, DataTypes) {
  const Channel = sequelize.define("Channel", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    sheetId: {
      type: DataTypes.STRING,
      allowNull: false
    },
	feedChannel: {
		type: DataTypes.STRING,
		allowNull: true
	}

  },
  {
    timestamps: true
  });

  Channel.associate = models => {
    Channel.belongsTo(models.Guild, { foreignKey })
  }

  return Channel;
};
