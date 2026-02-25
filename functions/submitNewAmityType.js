const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { ButtonStyle, ComponentType } = require('discord.js');
const db = require('../models');

async function submitNewAmityType(interaction, type, isSubmission) {
  type = type.toLowerCase();
  await interaction.channel.send(`Please post the entire ${type} exactly as it appears in a message, including numbers and punctuation.`);
  const message = await interaction.channel.awaitMessages({
    filter: m => m.author.id === interaction.user.id && !m.attachments.first(),
    max: 1
  });
  const messageText = message.first().content;
  const processedText = messageText.replace(/\d+%/, '%').replace(/\d+/, '#');

  let bonuses = await db.Bonus.findAll();
  bonuses = [...new Set(bonuses.map(e => e.dataValues.bonus))];
  let maluses = await db.Malus.findAll();
  maluses = [...new Set(maluses.map(e => e.dataValues.malus))];
  const chosenType = type === 'bonus' ? bonuses : maluses;
  // Named poorly maybe
  for (let bonus of chosenType) {
    if (processedText.toLowerCase() === bonus.toLowerCase()) {
      // already have it, 
      if (isSubmission) {
        const duplicateYesButton = new ButtonBuilder()
          .setCustomId('dupeyes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success);
        const duplicateNoButton = new ButtonBuilder()
          .setCustomId('dupeno')
          .setLabel('No')
          .setStyle(ButtonStyle.Danger);

        const duplicateRow = new ActionRowBuilder()
          .addComponents(duplicateYesButton)
          .addComponents(duplicateNoButton);
        const duplicateMessage = await interaction.channel.send({ content: `I already knew this ${type}, do you want me to add it to the previous submission? Double check that this was the correct missing ${type}.`, components: [duplicateRow]});
        const duplicateEvent = await duplicateMessage.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button});
        if (duplicateEvent.customId === 'dupeyes') {
          duplicateEvent.update({ content: `Adding missing ${type} to previous submission...`, components: []})
          return processedText;
        } else {
          duplicateEvent.update({ content: `Canceling submission.`, components: []});
          return false;
        }
      } else await interaction.channel.send(`I already know that ${type}.`);
      return;
    }
  }
  // Amity not recognized...
  const yesButton = new ButtonBuilder()
    .setCustomId('yes')
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success)
  const noButton = new ButtonBuilder()
    .setCustomId('no')
    .setLabel('No')
    .setStyle(ButtonStyle.Danger)
  const buttonRow = new ActionRowBuilder()
    .addComponents(yesButton)
    .addComponents(noButton)

  const confirmMessage = await interaction.channel.send({ content: `Are you sure you want to add the following ${type}? \`${processedText}\``, components: [buttonRow]});
  const confirmEvent = await confirmMessage.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button});
  if (confirmEvent.customId === 'yes') {
    const options = {};
    options[type.toLowerCase()] = processedText;
    await db[type.charAt(0).toUpperCase() + type.slice(1)].upsert(options);
    await confirmEvent.update({ content: `New ${type} added.`, components: []})
    if (isSubmission) return processedText;
    return true;
  } else {
    confirmEvent.update({ content: `New ${type} submission canceled.`, components: []});
    return false;
  }


}

module.exports = submitNewAmityType;