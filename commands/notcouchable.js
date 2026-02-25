const { SlashCommandBuilder, EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, Events } = require('discord.js');
const db = require('../models');
const loadSpreadsheet = require('../functions/loadSpreadsheet');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notcouchable')
        .setDescription('Set a specific UTC to be non-couchable.')
    .addNumberOption(option => option.setName('utc').setDescription('Post the UTC time you are submitting for, or if left blank, current time.')),
    async execute(interaction, userTable, sheets) {
      await interaction.deferReply();
      let utc;
      const utcOption = interaction.options.get('utc');
      if (!utcOption) { 
        utc = new Date().getUTCHours();
      } else if (utcOption.value < 0 || utcOption.value > 23) {
        return interaction.editReply('Please input a valid UTC 0-23.');
      } else {
        utc = Math.floor(utcOption.value);
      }
      const dbChannel = await db.Channel.findByPk(interaction.channel.id);
      if (!dbChannel) return interaction.editReply('Please set the sheet for this channel via `/setchannel` before attempting to submit.');

      // old code, sheets are cached top-level and accessed via the sheets Map
      let doc = sheets.get(dbChannel.sheetId);
      if (!doc) {
        console.log(`Sheet ${dbChannel.sheetId} was not cached.. loading + adding to cache..`);
        doc = await loadSpreadsheet(dbChannel.sheetId);
        sheets.set(dbChannel.id, doc);
      }
      // Testing if we have edit permission
      await doc.updateProperties({ title: doc.title });

      const weekSheet = doc.sheetsByIndex[1];
      
      // weekSheet cells are loaded within loadSpreadsheet now
        // await weekSheet.loadCells();
      if (weekSheet.getCell(2, 0).value !== 'Arcanist Map') {
        return interaction.editReply('I don\'t recognize this spreadsheet.');
      }

      const cell = weekSheet.getCell(3, 2 + utc);
      if (cell.value) {
        
        const yesButton = new ButtonBuilder()
          .setCustomId('yes')
          .setStyle('Success')
          .setLabel('Yes');
        const noButton = new ButtonBuilder()
          .setCustomId('no')
          .setStyle('Danger')
          .setLabel('No');
        const row = new ActionRowBuilder()
          .addComponents(yesButton)
          .addComponents(noButton);
        const reply = await interaction.editReply({ content: 'Do you want to overwrite the existing cell?' , components: [row]})
        const buttonEvent = await reply.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, ComponentType: ComponentType.ActionRow});
        if (buttonEvent.customId === 'no') {
          await interaction.editReply({ content: 'No changes were made.', components: []});
          return;
        }
      
      }

      cell.value = "No";
      await weekSheet.saveUpdatedCells();
      await interaction.editReply(`Couchable status set to no for utc ${utc}.`);
    },
  };