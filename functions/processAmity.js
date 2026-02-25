const db = require('../models');
// let { bonuses, maluses } = require('../config/amitytable.json');

// bonuses = [...new Set(bonuses)].map(e => e.replace(/#/g, '\\d*').replace(/%/g, '\\d*%')).map(e => new RegExp(e, 'i'));
// maluses = [...new Set(maluses)].map(e => e.replace(/#/g, '\\d*').replace(/%/g, '\\d*%')).map(e => new RegExp(e, 'i'));


async function processAmity(imgText) {
  let bonuses = await db.Bonus.findAll();
  let maluses = await db.Malus.findAll();
  bonuses = bonuses.map(e => e.dataValues.bonus);
  bonuses = [...new Set(bonuses)].map(e => e.replace(/#/g, '[+-]?\\d+(\\.\\d+)?').replace(/%/g, '[+-]?\\d+(\\.\\d+)?%')).map(e => new RegExp(e, 'i'));
  maluses = maluses.map(e => e.dataValues.malus);
  maluses = [...new Set(maluses)].map(e => e.replace(/#/g, '[+-]?\\d+(\\.\\d+)?').replace(/%/g, '[+-]?\\d+(\\.\\d+)?%')).map(e => new RegExp(e, 'i'));

  const matchedBonuses = [];
  const matchedMaluses = [];
  for (let bonus of bonuses) {
    const match = imgText.match(bonus);
    if (match) {
      matchedBonuses.push(match[0])
    }
  }
  for (let malus of maluses) {
    const match = imgText.match(malus);
    if (match) {
      matchedMaluses.push(match[0])
    }
  }
  console.log(matchedBonuses);
  console.log(matchedMaluses);
  if (!matchedBonuses.length && !matchedMaluses.length) return false;
  matchedBonuses.sort((a, b) => imgText.search(a) - imgText.search(b));
  matchedMaluses.sort((a, b) => imgText.search(a) - imgText.search(b));
  return {matchedBonuses: [...new Set(matchedBonuses)], matchedMaluses: [...new Set(matchedMaluses)]};
}

// const processImage = require('./processImage');
// const testImage = 'https://cdn.discordapp.com/attachments/1054824159273820254/1056294358879580301/IMG_4978.png';
// (async function () {
//   console.log(await processAmity(await processImage(testImage)));
// }())


module.exports = processAmity;