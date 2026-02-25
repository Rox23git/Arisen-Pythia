module.exports = function(sequelize, DataTypes) {
    const Submission = sequelize.define("Submission", {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        parentSheet: {
            type: DataTypes.UUID,
            allowNull: false
        },
        nodeLetter: {
            type: DataTypes.STRING,
            allowNull: false
        },
        answerNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        firstBonusKey: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        firstBonusValue: {
            type: DataTypes.DECIMAL
        },
        secondBonusKey: {
            type: DataTypes.INTEGER
        },
        secondBonusValue: {
            type: DataTypes.DECIMAL
        },
        thirdBonusKey: {
            type: DataTypes.INTEGER
        },
        thirdBonusValue: {
            type: DataTypes.DECIMAL
        },
        normalMalusKey: {
            type: DataTypes.INTEGER
        },
        normalMalusValue: {
            type: DataTypes.DECIMAL
        },
        firstLegendMalusKey: {
            type: DataTypes.INTEGER
        },
        firstLegendMalusValue: {
            type: DataTypes.DECIMAL
        },
        secondLegendMalusKey: {
            type: DataTypes.INTEGER
        },
        secondLegendMalusValue: {
            type: DataTypes.DECIMAL
        },
        firstOrnateMalusKey: {
            type: DataTypes.INTEGER
        },
        firstOrnateMalusValue: {
            type: DataTypes.DECIMAL
        },
        secondOrnateMalusKey: {
            type: DataTypes.INTEGER
        },
        secondOrnateMalusValue: {
            type: DataTypes.DECIMAL
        },
        thirdOrnateMalusKey: {
            type: DataTypes.INTEGER
        },
        thirdOrnateMalusValue: {
            type: DataTypes.DECIMAL
        }
    });
    return Submission;
};