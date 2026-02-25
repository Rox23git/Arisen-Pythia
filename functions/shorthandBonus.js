function shorthandBonus(bonus, bonuses) {
    // loading bonuses at a higher level to reduce excessive db calls; this function should by synchronous anyway
        // let bonuses = await db.Bonus.findAll();
    bonus = bonus.toString();
    var bonusValues = bonus.match(/\d+/g);
    var finalShorthand = "";

    bonuses.forEach(function (b){
        let bonusRegEx = new RegExp(b.dataValues.bonus.replace(/#/g, '[+-]?\\d+(\\.\\d+)?').replace(/%/g, '[+-]?\\d+(\\.\\d+)?%'), 'i');

        if(bonus.match(bonusRegEx) && finalShorthand == ""){
            var shorthand = b.dataValues.bonusShorthand;
			if(bonusValues){
				shorthand = shorthand.replace('#', bonusValues[0]).replace('%', (bonusValues[0] + "%"));
			}
            finalShorthand = shorthand;
        }
    });

    return finalShorthand;
}

module.exports = shorthandBonus;