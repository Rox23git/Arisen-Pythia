module.exports = function(sequelize, DataTypes) {
  const DevMsg = sequelize.define("DevMsg", {
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true
  });
  return DevMsg;
};

