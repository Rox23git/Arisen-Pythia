const { SlashCommandBuilder } = require('discord.js');
const db = require('../models');

const userTable = {
    184486179574513664: true,
    495075757836468226: true,
    114017862582009863: true
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('viewwhitelist')
		.setDescription('View server whitelist for use by bot owners.'),
	async execute(interaction) {
        if (!interaction.user.id in userTable) 
            return interaction.reply('You do not have permission to use this command.');
        const whitelist = await db.Guild.findAll();
        const mappedWhitelist = whitelist.map(e => e.id);
        await interaction.reply({content: `\`\`\`Whitelisted Server Ids:\n${mappedWhitelist}\`\`\``, ephemeral: true});
        console.log('got here');
    },
};
