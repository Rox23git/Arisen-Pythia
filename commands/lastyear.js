const { SlashCommandBuilder, EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const getSheetSummary = require("../functions/getSheetSummary");
const loadSpreadsheet = require('../functions/loadSpreadsheet');
const db = require('../models');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('lastyear')
        .setDescription('View a summary for last year, if available.')
        ,
    
    async execute(interaction){
        // loading bonuses for getSheetSummary
        const bonuses = await db.Bonus.findAll();
        try {
            await interaction.deferReply({});
            console.log("Starting command");
            const dbChannel = await db.Channel.findByPk(interaction.channel.id);
            if (!dbChannel) return interaction.editReply({content: 'This command can only be used in submission channels.', ephemeral: true});
            
            const doc = await loadSpreadsheet(dbChannel.sheetId);
            const weekSheet = doc.sheetsByIndex[1];
            await weekSheet.loadCells('F1');
            console.log("Got week sheet");
            var lastYearLink = weekSheet.getCell(0,5).hyperlink;
            console.log(lastYearLink);
            if(lastYearLink != ""){
                var lastYearGID = lastYearLink.match(/\=(.*?)\&/)[1];
                console.log("Last year GID: " + lastYearGID);
                const oldSheet = doc.sheetsById[lastYearGID];
                console.log(oldSheet == null);
                var outputArray = await getSheetSummary(dbChannel.sheetId, oldSheet, bonuses);

                await interaction.editReply(`Summary:`);
                for(var m in outputArray){
                    await interaction.followUp(outputArray[m]);
                }

            } else {
                await interaction.followUp("I could not find last year's sheet linked in this spreadsheet.");
            }

        } catch (e){
            console.log(e);
        }
    }
}