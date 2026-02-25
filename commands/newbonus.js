const { SlashCommandBuilder } = require('discord.js');

const submitNewAmityType = require('../functions/submitNewAmityType');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newbonus')
		.setDescription('Add a new bonus/malus that the bot should detect.')
    .addStringOption(option => option.setName('type').setDescription('Please type "bonus" or "malus".').setRequired(true)),
	async execute(interaction, userTable) {
    const type = interaction.options.get('type').value;
    console.log(type);
    if (!(/^bonus$/i.test(type) || /^malus$/i.test(type))) return interaction.reply('Please choose either bonus or malus.');
    await interaction.reply({ content: `You chose ${type}`, ephemeral: true})
    await submitNewAmityType(interaction, type, false);
  }
}