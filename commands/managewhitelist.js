const { SlashCommandBuilder } = require('discord.js');
const db = require('../models');

const userTable = {
    184486179574513664: true,
    495075757836468226: true,
    114017862582009863: true
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('managewhitelist')
		.setDescription('Manage bot whitelist for use by bot owners.')
		.addStringOption(option => 
            option.setName('mode')
                .setDescription('Type "add" or "remove".')
                .setRequired(true))
        .addStringOption(option =>
            option.setName("id")
                .setDescription('Paste the ID for the server to add/remove from whitelist.')
                .setRequired(true)),
	async execute(interaction) {
        if (!interaction.user.id in userTable) 
            return interaction.reply('You do not have permission to use this command.');
        const mode = interaction.options.get('mode').value.toLowerCase();
        const id = interaction.options.get('id').value;
        let result;
        try{
        if (mode == 'add') {
            result = await db.Guild.upsert({id, whitelisted: true});
        } else if (mode == 'remove') {
            result = await db.Guild.destroy({where: {id}});
        } else
            return interaction.reply({ content: 'Please use "add" or "remove" for your mode selection.', ephemeral: true})
        if (result) {
            interaction.reply({content: `${id} has been ${mode == 'add' ? 'added to' : 'removed from'} the whitelist.`, ephemeral: true})
        } else return interaction.reply({content: 'Something weird happened', ephemeral: true})
        } catch(err) {
            console.log(err);
        }
    },
};
