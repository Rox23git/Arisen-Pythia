const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const loadSpreadsheet = require('../functions/loadSpreadsheet');
const db = require('../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Information about the options provided.')
		.addStringOption(option => 
      option.setName('sheet')
      .setDescription('The link or ID of the amity sheet for this channel.')
      .setRequired(true)),
	async execute(interaction, userTable, sheets) {
    await interaction.deferReply();
    const sheetOption = interaction.options.get('sheet', true).value;
    let sheetId = sheetOption;
    if (/docs\.google\.com/i.test(sheetId)) {
      // Extracting the ID from a given URL via regex
      const matchedId = sheetId.match(/\/d\/.*\//)[0];
      sheetId = matchedId.slice(3, matchedId.length - 1);
    }
    console.log(sheetId);
    const { channel } = interaction;
    const dbChannel = await db.Channel.findOne({ where: { id: channel.id }});
    // console.log(dbChannel);

    // do not implement new loading here; first time a sheet is added, won't be cached
    const sheet = await loadSpreadsheet(sheetOption);
    const error = await sheet.updateProperties({ title: sheet.title })
      .catch(err => {
        if (err.config.method == 'post' || err.response.status === 403 || err.config.method == 'get') {
          interaction.editReply("I don't have edit access for that sheet! Please provide edit access to `amityhunter@amityhunter.iam.gserviceaccount.com` and try again!");
        } else {
          console.log(err);
          interaction.editReply('error!');
        }
        return true;
      });
    if (error) return;
    console.log('here');
    let content = `Are you sure you want to set this channel's default amity submission sheet to ${sheet.title}?`
    const approveButton = new ButtonBuilder()
        .setCustomId('approve')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);
      const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder()
        .addComponents(approveButton)
        .addComponents(cancelButton)
    if (dbChannel) {
      if (sheetId == dbChannel.sheetId) return await interaction.editReply(`\`${sheetId}\` is already configured for this channel.`);
      content = `There is already a sheet configured for this channel with ID: \`${dbChannel.sheetId}\`. Would you like to override?`;
    }
    
    const reply = await interaction.editReply({ content, components: [row]});
    const buttonEvent = await reply.awaitMessageComponent({componentType: ComponentType.Button});
    if (buttonEvent.customId == 'approve') {
      await db.Guild.upsert({ id: channel.guildId });
      await db.Channel.upsert({ id: channel.id, sheetId, GuildId: channel.guildId, });
      await buttonEvent.update({ content: `New sheet with ID: \`${sheetId}\` configured for this channel!`, components: []});
      // add sheet to cache
      sheets.set(sheetId, sheet);

    } else {
      return buttonEvent.update({ content: 'Command canceled! ❌', components: []});
    }

	},
};
