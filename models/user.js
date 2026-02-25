module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define("User", {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      exp: {
          type: DataTypes.BIGINT,
          defaultValue: 0
      }
    },
    {
      timestamps: true
    });
    return User;
};

  