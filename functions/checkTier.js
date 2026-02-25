const db = require('../models');

function checkTier(bonus, bonuses) {
    // loading bonuses at a higher level as to make this function synchronous and reduce excessive db calls
        // let bonuses = await db.Bonus.findAll();
    
    bonus = bonus.toString(); //just in case
    let tier = 0;

    bonuses.forEach(function (b){
        let bonusRegEx = new RegExp(b.dataValues.bonus.replace(/#/g, '\\d*').replace(/%/g, '\\d*%'), 'i');
        if(bonus.match(bonusRegEx)){
            let flagRolls = [];
            if(b.dataValues.flagRolls != null)
                flagRolls = b.dataValues.flagRolls.split(",");

            if(b.dataValues.tier === 0 || b.dataValues.tier == null){
                tier = 0;
                return;
            } else {
                firstNum = bonus.match(/\d+/)
                if(firstNum == null){
                    tier = b.dataValues.tier;
                    return;
                } else if(flagrolls.includes(String(firstNum[0])) || b.dataValues.maxRoll == null){
                    tier = b.dataValues.tier;
                    return;
                } else {
                    tier = 0;
                    return;
                }
            }
        }
    });

    return tier;
    //return 0;
}

module.exports = checkTier;