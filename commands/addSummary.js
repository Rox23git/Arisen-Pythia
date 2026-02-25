const { SlashCommandBuilder } = require('discord.js');
const getLatestSummary = require("../functions/getLatestSummary");
const db = require('../models');

const userTable = {
    184486179574513664: true,
    495075757836468226: true,
    114017862582009863: true
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsummary')
        .setDescription('Add a new summary message to the bot. This will remove previous summary messages for this channel.')
        .addStringOption(option =>
            option.setName('destination')
                .setDescription('Destination channel ID')
                .setRequired(true)),
    async execute(interaction) {
        // load bonuses for getLatestSummary
        const bonuses = await db.Bonus.findAll();

        if (!interaction.user.id in userTable) 
            return interaction.reply({content:'You do not have permission to use this command.', ephemeral: true});

        const dbChannel = await db.Channel.findByPk(interaction.channel.id);
        if (!dbChannel) 
            return interaction.reply({content: 'This command can only be used in submission channels.', ephemeral: true});
        
        await interaction.deferReply({ephemeral: true});

        const destinationOption = interaction.options.get('destination');
        const summaryMsgChannel = interaction.client.channels.cache.get(destinationOption.value);
        const summaryMsg = await summaryMsgChannel.send("Summary loading...");

        let summaryMessages = await db.SummaryMessage.findAll({where: {isDeleted: false, sheetId: dbChannel.sheetId}});
        if(summaryMessages.length > 0){
            await interaction.followUp({content: 'Previous summary message found. It will no longer refresh.', ephemeral: true});
            await db.SummaryMessage.destroy({where: {isDeleted: false, sheetId: dbChannel.sheetId}});
        }

        let result = await db.SummaryMessage.upsert({messageId: summaryMsg.id, channelId: summaryMsgChannel.id, guildId: interaction.guildId, sheetId: dbChannel.sheetId, isDeleted: false});
        if(result){
            await interaction.editReply({content: "New summary channel added!", ephemeral: true});
        }

        var summaryOutput = await getLatestSummary(dbChannel.sheetId, bonuses);
        summaryMsg.edit(summaryOutput[0]);

    }
}