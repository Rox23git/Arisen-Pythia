const { SlashCommandBuilder } = require('discord.js');
const db = require('../models');

// this command sucks and should use a modal and isn't storing large strings
module.exports = {
	data: new SlashCommandBuilder()
		.setName('contact')
		.setDescription('Send a message or any feedback to the developer.')
		.addStringOption(option => 
      option.setName('message')
      .setDescription('Type your message.')
      .setRequired(true)),
	async execute(interaction) {
    const message = interaction.options.get('message').value;
		const resp = await db.DevMsg.create({ message: message.slice(0, 5000), userId: interaction.user.id }).catch(err => {});
		return await interaction.reply('Message recorded.');
	},
};
