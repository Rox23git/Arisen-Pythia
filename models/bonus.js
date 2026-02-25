module.exports = function(sequelize, DataTypes) {
  const Bonus = sequelize.define("Bonus", {
    bonus: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tier: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxRoll: {
      type: DataTypes.STRING,
      allowNull: true
    },
    flagRolls: {
      type: DataTypes.STRING,
      allowNull: true
    },
	bonusShorthand: {
	  type: DataTypes.STRING,
	  allowNull: true
	}
  },
  {
    timestamps: true
  });
  return Bonus;
};

