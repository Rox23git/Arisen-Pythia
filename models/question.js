module.exports = function(sequelize, DataTypes) {
  const Question = sequelize.define("Question", {
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    timestamps: true
  });
  return Question;
};

