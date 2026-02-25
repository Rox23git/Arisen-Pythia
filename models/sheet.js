module.exports = function(sequelize, DataTypes) {
    const Sheet = sequelize.define("Sheet", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        parentParty:{
            type: DataTypes.UUID,
            allowNull: false
        },
        WeekNumber: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        Year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        QuestionA:{
            type: DataTypes.INTEGER
        },
        QuestionB:{
            type: DataTypes.INTEGER
        },
        QuestionC:{
            type: DataTypes.INTEGER
        },
        QuestionD:{
            type: DataTypes.INTEGER
        },
        QuestionE:{
            type: DataTypes.INTEGER
        },
    });
    return Sheet;
};