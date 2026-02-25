const { SlashCommandBuilder } = require('discord.js');
const db = require('../models');

const userTable = {
    184486179574513664: true,
    495075757836468226: true,
    114017862582009863: true
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendalert')
        .setDescription('Sends an alert to all submission channels')
        .addStringOption(option =>
        option.setName('message')
            .setDescription('Message to be sent')
            .setRequired(true)),
    async execute(interaction) {
        if (!interaction.user.id in userTable)
            return interaction.reply('You do not have permission to use this command.');
        const message = interaction.options.get('message').value;
        const submissionChannels = await db.Channel.findAll();
        console.log(submissionChannels);
        console.log(message);
        for (const channel of submissionChannels) {
           var guild = interaction.client.guilds.cache.get(channel.GuildId);
           if (!guild){
               continue;
           }

           var c = await guild.channels.fetch(channel.id);
           if (!c){
               continue;
           } else {
               c.send(message);
           }
        }
        return await interaction.reply('Alert sent');
    }
}