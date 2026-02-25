module.exports = function(sequelize, DataTypes) {
  const Malus = sequelize.define("Malus", {
    malus: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    timestamps: true
  });
  return Malus;
};

