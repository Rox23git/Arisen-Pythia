const { SlashCommandBuilder, EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const getLatestSummary = require("../functions/getLatestSummary");
const db = require('../models');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('summarizeweek')
        .setDescription('View a summary for the entire week.')
        ,
    
    async execute(interaction, userTable, sheets) {
        const bonuses = await db.Bonus.findAll();
        try {
            await interaction.deferReply({});

            const dbChannel = await db.Channel.findByPk(interaction.channel.id);
            if (!dbChannel) return interaction.editReply({content: 'This command can only be used in submission channels.', ephemeral: true});
      
            const doc = sheets.get(dbChannel.sheetId);
            var outputArray = await getLatestSummary(doc, bonuses);

            await interaction.editReply(`Summary:`);
            for(var m in outputArray){
                await interaction.followUp(outputArray[m]);
            }
        } catch (e){
            console.log(e);
        }
    }
}