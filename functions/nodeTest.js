const db = require('../models');
async function nodeTest(text) {
	let questions = await db.Question.findAll();
	questions = questions.map(e => e.dataValues.question);
	for (let question of questions) {
		const match = text.match(question);
		if(match) return match[0];
	}
	return false;
}

module.exports = nodeTest;