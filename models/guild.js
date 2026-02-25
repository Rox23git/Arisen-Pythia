module.exports = function(sequelize, DataTypes) {
  const Guild = sequelize.define("Guild", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    whitelisted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }

  },
  {
    timestamps: true
  });
  return Guild;
};

