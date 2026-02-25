const { SlashCommandBuilder, EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, Events } = require('discord.js');
const loadSpreadsheet = require('../functions/loadSpreadsheet');
const nodeTest = require('../functions/nodeTest');
const processAmity = require('../functions/processAmity');
const processImage = require('../functions/processImage');
const checkTier = require("../functions/checkTier");
const db = require('../models');

async function resolveConflict(message, interaction, type) {
  const warningYesButton = new ButtonBuilder()
    .setCustomId('yes')
    .setLabel('Yes, overwrite')
    .setStyle(ButtonStyle.Success);
  const warningNoButton = new ButtonBuilder()
    .setCustomId('no')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Danger);
  const warningRow = new ActionRowBuilder()
    .addComponents(warningYesButton)
    .addComponents(warningNoButton);
  const warningReply = await message.reply({ content: `Conflict detected! There is already an ${type} posted at that location on this party\'s sheet. Are you sure you would like to procede and overwrite?`, components: [warningRow]});
  const warningButtonEvent = await warningReply.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button});
  if (warningButtonEvent.customId === 'no') {
    await message.react('❌');
    await warningButtonEvent.update({ content: 'Submission canceled.', components: []});
    return false;
  }
  await warningButtonEvent.update({ content: 'Override selected.', components: []});
  return true;
}

async function promptAmityCode(message, interaction) {
  const letterSelect = new StringSelectMenuBuilder()
    .setCustomId('amityletter')
    .setPlaceholder('Select amity letter.')
    .addOptions([
      {
        label: 'A',
        value: 'A'
      },
      {
        label: 'B',
        value: 'B'
      },
      {
        label: 'C',
        value: 'C'
      },
      {
        label: 'D',
        value: 'D'
      },
      {
        label: 'E',
        value: 'E'
      },
    ]);
  const numberSelect = new StringSelectMenuBuilder()
    .setCustomId('amitynumber')
    .setPlaceholder('Select amity number.')
    .addOptions([
      {
        label: '1',
        value: '1'
      },
      {
        label: '2',
        value: '2'
      },
      {
        label: '3',
        value: '3'
      },
      {
        label: '4',
        value: '4'
      },
      {
        label: '5',
        value: '5'
      },
    ]);
  const letterRow = new ActionRowBuilder()
    .addComponents(letterSelect)
  const numberRow = new ActionRowBuilder()
    .addComponents(numberSelect);

  const reply = await message.reply({ content: 'Amity detected without a complete code! Please select code below.', components: [letterRow]});
  const letterSelectEvent = await reply.awaitMessageComponent({ 
    filter: i => i.customId === 'amityletter' && i.user.id === interaction.user.id,
    componentType: ComponentType.StringSelect
  });
  const letter = letterSelectEvent.values[0];
  const letterReply = await letterSelectEvent.update({ content: `You selected letter ${letter}. Now, please select the number 1-5.`, components: [numberRow]});
  const numberSelectEvent = await letterReply.awaitMessageComponent({
    filter: i => i.customId === 'amitynumber' && i.user.id === interaction.user.id,
    componentType: ComponentType.StringSelect
  });
  const number = numberSelectEvent.values[0];
  await numberSelectEvent.update({ content: `You selected code ${letter + number}.`, components: []});
  return letter + number;
}

async function promptNodeLetter(message, interaction) {
  const letterSelect = new StringSelectMenuBuilder()
    .setCustomId('nodeletter')
    .setPlaceholder('Select node letter.')
    .addOptions([
      {
        label: 'A',
        value: 'A'
      },
      {
        label: 'B',
        value: 'B'
      },
      {
        label: 'C',
        value: 'C'
      },
      {
        label: 'D',
        value: 'D'
      },
      {
        label: 'E',
        value: 'E'
      },
    ]);
  const row = new ActionRowBuilder()
    .addComponents(letterSelect);

  const reply = await message.reply({ ephemeral: true, content: 'Node detected without a letter! Please select the correct letter below.', components: [row]});
  const letterSelectEvent = await reply.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.StringSelect});
  await letterSelectEvent.update({ content: `Letter ${letterSelectEvent.values[0]} selected.`, components: []})
  return letterSelectEvent.values[0];
}

async function promptIsNodeCouchable(message, interaction){
  const nodeIsCouchable = new StringSelectMenuBuilder()
    .setCustomId('nodeiscouchable')
    .setPlaceholder('Select Yes, No, or Sometimes')
    .addOptions([
      {
        label: 'Yes',
        value: 'true'
      },
      {
        label: 'No',
        value: 'false'
      },
      {
        label: 'Sometimes',
        value: 'Sometimes'
      }
    ]);
  const row = new ActionRowBuilder()
    .addComponents(nodeIsCouchable);
  
  const reply = await message.reply({ephemeral: true, content: 'Please choose whether this node is couchable (if it can be done without moving).', components: [row]});
  const couchSelectEvent = await reply.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.StringSelect});
  await couchSelectEvent.update({content: `You selected: ${couchSelectEvent.values[0]}`, components: []});
  return couchSelectEvent.values[0];
}

const embeds = {
  noMap: new EmbedBuilder()
  .setTitle('Arcanist Map Missing!')
  .setDescription(`There is currently no Arcanist Map for this UTC. Please post one as a reply!`)
  .setColor('Yellow'),

  newMap: new EmbedBuilder()
    .setTitle('New Arcanist Map Detected')
    .setDescription('Are you sure you want to choose this image as the new Arcanist Map?')
    .setColor('Orange'),
  
  collectionMode: new EmbedBuilder()
    .setTitle('Post screenshots!')
    .setDescription('Post images in the chat one at a time. If it is a node question, please type the letter of the node (A-E). If it is an amity, please type node letter and number (e.g. A1).')
    .setColor('Green'),

  editMap: new EmbedBuilder()
    .setTitle(`Change Arcanist Map`)
    .setDescription('Post an image to update the map!')
    .setColor('Orange'),



}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('submit')
		.setDescription('Submit an Arcanist Map and it\'s corresponding nodes/amities.')
    .addNumberOption(option => option.setName('utc').setDescription('Post the UTC time you are submitting for, or if left blank, current time.'))
    //.addBooleanOption(option => option.setName('nomove').setDescription('Select true if you wish to label the no-move status for this UTC.')) //Removed in favor of asking this during question submission.
    ,

  async execute(interaction, userTable, sheets) {
    const filter = m => {
      const isSameAuthor = m.author.id == interaction.user.id;
      const hasAttachment = m.attachments.first();
      return isSameAuthor && hasAttachment;
    }
    console.log('submit command used');
    // This probably shouldnt all be in a generic try/catch block, I did this early on 
		try {
      await interaction.deferReply({});
      let utc;
      const utcOption = interaction.options.get('utc');
      if (!utcOption) { 
        utc = new Date().getUTCHours();
      } else if (utcOption.value < 0 || utcOption.value > 23) {
        return interaction.editReply('Please input a valid UTC 0-23.');
      } else {
        utc = Math.floor(utcOption.value);
      }
      //let nomove = false;
      //if (interaction.options.get('nomove')) nomove = interaction.options.get('nomove').value;

      const dbChannel = await db.Channel.findByPk(interaction.channel.id);
      if (!dbChannel) return interaction.editReply('Please set the sheet for this channel via `/setchannel` before attempting to submit.');

      let doc = sheets.get(dbChannel.sheetId);
      if (!doc) {
        console.log(`Sheet ${dbChannel.sheetId} was not cached.. loading + adding to cache..`);
        doc = await loadSpreadsheet(dbChannel.sheetId);
        sheets.set(doc);
      }
      if (!doc) return interaction.editReply('Error loading sheet, contact bot owner.');
      // Testing if we have edit permission
      await doc.updateProperties({ title: doc.title });

      const weekSheet = doc.sheetsByIndex[1];
      // loadCells moved to loadSpreadsheet.js
      // await weekSheet.loadCells();
      if (weekSheet.getCell(2, 0).value !== 'Arcanist Map') {
        return interaction.editReply('I don\'t recognize this spreadsheet.');
      }

      const couchCell = weekSheet.getCell(3, 0);
      let globalRowAdj = 0;
      let globalColAdj = 0;
      if (couchCell.value.match(/couch/i)) {
        globalRowAdj++;
      }

      const arcanistMapCell = weekSheet.getCell(2, utc + 2);
      for (const embed in embeds) {
        embeds[embed].setFooter({ text: `UTC: ${utc} on sheet ${weekSheet.title}` });
      }

      const approveButton = new ButtonBuilder()
      .setCustomId('approve')
      .setLabel('Yes')
      .setStyle(ButtonStyle.Success);

      const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder()
        .addComponents(approveButton)
        .addComponents(cancelButton);

      if (!arcanistMapCell.value) {
        const noMapEmbed = new EmbedBuilder()        
          .setTitle('Arcanist Map Missing!')
          .setDescription(`There is currently no Arcanist Map for this UTC. Please post one as a reply!`)
          .setColor('Yellow')

        await interaction.editReply({ embeds: [noMapEmbed] });
        const newMap = await interaction.channel.awaitMessages({ filter, max: 1});
        const newArcanistMapImage = newMap.first().attachments.first().attachment;

        // Decided this confirmation is unnecessary. edit options exist later if map is bad
          // const newMapEmbed = new EmbedBuilder()
          //   .setTitle('New Arcanist Map Detected')
          //   .setDescription(`Do you want to add this image as the Arcanist Map for UTC ${utc} on sheet ${weekSheet.title}?`)
          //   .setColor('Orange')
          //   .setImage(newArcanistMapImage);
          
          // const buttonMessage = await interaction.editReply({ embeds: [newMapEmbed], components: [row]});
          // const buttonEvent = await buttonMessage.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button});
          // if (buttonEvent.customId == 'cancel') return buttonEvent.update({ content: 'Submission canceled.', embeds: [], components: []});

        arcanistMapCell.value = newArcanistMapImage;
        await weekSheet.saveUpdatedCells();
        // await buttonEvent.update({});

      } else if (!arcanistMapCell.value.match('https')) return interaction.followUp('I don\'t understand this sheet. Is something weird in the Arcanist Map cell for UTC ' + utc + '?');

      const submissionCancelButton = new ButtonBuilder()
        .setCustomId('submissioncancel')
        .setLabel('Stop collecting images')
        .setStyle(ButtonStyle.Danger);

      const editArcanistMapButton = new ButtonBuilder()
        .setCustomId('editmap')
        .setLabel('Edit arcanist map')
        .setStyle(ButtonStyle.Primary);

      const finalRow = new ActionRowBuilder()
        .addComponents(submissionCancelButton)
        .addComponents(editArcanistMapButton);

      embeds.collectionMode.setImage(arcanistMapCell.value);
      
      // Managing no-move/couchable status before proceding to the default collection mode
      const couchableCell = weekSheet.getCell(3, utc + 2);
      
      // === Old couchable code, we've moved this to be on question submission instead ===

      // if (nomove === false) {
      //   couchableCell.value = 'No';
      //   await weekSheet.saveUpdatedCells();
      // } 
      // else if (nomove && couchCell.value.match(/couch/i)) {
      //   const couchableDescription = couchableCell.value ? 
      //     `You are now editing the couchable status for UTC ${utc}. Current status: \`${weekSheet.value}\`` :
      //     `Please select the couchable status for UTC ${utc}.`

      //   const couchableEmbed = new EmbedBuilder()
      //     .setTitle(`Submitting couchable status for UTC ${utc}.`)
      //     .setColor('Purple')
      //     .setDescription(couchableDescription)
      //     .setFooter({ text: `UTC: ${utc} on sheet ${weekSheet.title}` })
      //     .setImage(arcanistMapCell.value);


      //   const multiSelect = new StringSelectMenuBuilder()
      //     .setCustomId('couchablenodes')
      //     .setPlaceholder('Select couchable node letters, or hit none if none apply.')
      //     .setMinValues(1)
      //     .setMaxValues(5)
      //     .addOptions([
      //       {
      //         label: 'A',
      //         value: 'A'
      //       },
      //       {
      //         label: 'B',
      //         value: 'B'
      //       },
      //       {
      //         label: 'C',
      //         value: 'C'
      //       },
      //       {
      //         label: 'D',
      //         value: 'D'
      //       },
      //       {
      //         label: 'E',
      //         value: 'E'
      //       },
      //     ]);
    
      //   const noneButton = new ButtonBuilder()
      //     .setCustomId('none')
      //     .setStyle('Danger')
      //     .setLabel('None');
    
      //   const selectRow = new ActionRowBuilder()
      //     .addComponents(multiSelect)
      //   const buttonRow = new ActionRowBuilder()
      //     .addComponents(noneButton);

      //   const couchableReply = await interaction.editReply({embeds: [couchableEmbed], components: [selectRow, buttonRow]});
      //   const couchableEvent = await couchableReply.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, ComponentType: ComponentType.ActionRow});
      //   if (couchableEvent.customId === 'none') {
      //     couchableCell.value = 'No';
      //     await weekSheet.saveUpdatedCells();
      //     couchableEvent.update({content: `Couchable status for UTC ${utc} set to none.`})
      //   } else {
      //     let cellString = 'Yes - ';
      //     couchableEvent.values.forEach(letter => cellString += letter + ', ');
      //     cellString = cellString.substring(0, cellString.length - 2);
      //     couchableCell.value = cellString;
      //     await weekSheet.saveUpdatedCells();
      //     await couchableEvent.update({ content: `Couchable status for UTC ${utc} set to \`${cellString}\`.`})
      //   }
      // }


      const mainReply = await interaction.editReply({ embeds: [embeds.collectionMode], components: [finalRow]});

      const nodes = [];
      const amities = [];
      const imageCollector = interaction.channel.createMessageCollector({ filter, time: 600000, max: 30});
      userTable[interaction.user.id] = {
        collector: imageCollector,
        timestamp: new Date()
      };
      imageCollector.on('collect', async m => {
        const imgText = await processImage(m.attachments.first().attachment);
        const isNode = await nodeTest(imgText);
        if (isNode) {
          console.log('node.. here');
          const nodeLetterMatch = m.content.match(/[abcde]/i);
          let nodeLetter = nodeLetterMatch ? nodeLetterMatch[0] : await promptNodeLetter(m, interaction);
          nodeLetter = nodeLetter.toUpperCase();
          const isCouchable = await promptIsNodeCouchable(m, interaction);
          console.log(isCouchable);
          if (nodeLetter) {
            const letterValue = 'abcde'.search(new RegExp(nodeLetter, 'i'));
            const y = 3 + letterValue * 16 + globalRowAdj;
            const x = 2 + utc + globalColAdj;
            const questionCell = weekSheet.getCell(y, x);
            if (questionCell.value) {
              if (!await resolveConflict(m, interaction, 'node')) return;
            }
            questionCell.value = isNode;
            await weekSheet.saveUpdatedCells();
            await m.react('✅');
            nodes.push(isNode);
          } else throw new Error();
          if (isCouchable !== 'false') {
            console.log('here.. is couchable');
            // Add an asterisk to nodeLetter if "Sometimes" couchable option selected
            if (isCouchable === 'Sometimes') nodeLetter += '^';

            if(couchableCell.value != "No"){
              if(couchableCell.value == null){
                couchableCell.value = nodeLetter + ", ";
              } else {
                couchableCell.value = couchableCell.value + (nodeLetter + ", ");
              }
            } else {
              couchableCell.value = nodeLetter;
            }
            await weekSheet.saveUpdatedCells();
          } else {
            if(couchableCell.value == null){
              couchableCell.value = "No";
              await weekSheet.saveUpdatedCells();
            }
          }
          return;
        }
        const amity = await processAmity(imgText);
        if (amity) {

          if (amity.matchedBonuses.length !== amity.matchedMaluses.length) {
            await m.reply({ content: `Number of bonuses and maluses detected are unequal. \nBonuses: \`${JSON.stringify(amity.matchedBonuses)}\` \nMaluses: \`${JSON.stringify(amity.matchedMaluses)}\`\nMost likely, I failed to identify one because that bonus or malus was not in my tables. Please contact bot owner to get missing bonus/malus added to the bot.`});
            return await m.react('❌');
          }
          const amityCodeMatch = m.content.match(/[abcde]\d/i);
          const amityCode = amityCodeMatch ? amityCodeMatch[0] : await promptAmityCode(m, interaction);
          if (amityCode) {
            var isCouchableNode = false;
            if(couchableCell.value != null){
               isCouchableNode = couchableCell.value.toLowerCase().includes(amityCode[0].toLowerCase());
            }
            var couchableString = "";
            if(isCouchableNode){
              couchableString = "This amity is likely couchable."
            }

            const letterValue = 'abcde'.search(new RegExp(amityCode[0], 'i'));
            const numberValue = +amityCode[1];
            let y = 4 + (letterValue * 16) + ((numberValue - 1) * 3) + globalRowAdj;
            let x = 2 + utc + globalColAdj;
            for (let i = 0; i < amity.matchedBonuses.length; i++) {
              const cell = weekSheet.getCell(y + i, x);
              if (cell.value && cell.value !== amity.matchedBonuses[i]) {
                if (!await resolveConflict(m, interaction, 'amity')) return;
              }
              // let bonusTier = await checkTier(amity.matchedBonuses[i]);
              cell.value = amity.matchedBonuses[i];
              // if(bonusTier == 1){
              //   cell.textFormat = {bold: true};
              //   //We also want to make the background color gold... Which is surprisingly difficult.
              //   //FUTURE: Have some kind of notification system tied into this.
              // }
              // if(bonusTier == 2){
              //   cell.textFormat = {bold: true};
              // }
            }
            const malusCell = weekSheet.getCell(y + amity.matchedMaluses.length - 1, x);
            let malusString = '';
            amity.matchedMaluses.forEach(malus => malusString += malus + ',\n');
            malusCell.note = malusString;
            await weekSheet.saveUpdatedCells();
            await m.react('✅');
            await m.react(amity.matchedBonuses.length == 1 ? '1️⃣' : amity.matchedBonuses.length == 2 ? '2️⃣' : '3️⃣');
            amities.push(amity);
            
            const bonuses = await db.Bonus.findAll();
            // checkTier is synchronous now, takes all bonuses as an arg
            const amityTier = checkTier(amity.matchedBonuses[0], bonuses);
            
            if(amityTier != 0 && dbChannel.feedChannel != null){
              const feedChannel = m.client.channels.cache.get(dbChannel.feedChannel);
              let tierString = amityTier == 1 ? 'S-tier' : 'A-Tier';

              if(amity.matchedBonuses.length == 1){
                await feedChannel.send(`Found in: <#${m.channelId}>\n\nA Famed/Superior ${tierString} amity has been found at UTC ${utc} by ${m.member.displayName} at **${amityCode}**! \n\n Bonus: **${amity.matchedBonuses[0]}** \n\n Malus: ${amity.matchedMaluses[0]} \n\n ${couchableString} \n ==`);
              } else if (amity.matchedBonuses.length == 2){
                await feedChannel.send(`Found in: <#${m.channelId}>\n\nA Legendary ${tierString} amity has been found at UTC ${utc} by ${m.member.displayName} at **${amityCode}**! \n \n Bonus #1: **${amity.matchedBonuses[0]}** \n Bonus #2: ${amity.matchedBonuses[1]} \n\n Malus #1: ${amity.matchedMaluses[0]} \n Malus #2: ${amity.matchedMaluses[1]} \n\n ${couchableString} \n ==`);
              } else if (amity.matchedBonuses.length == 3){
                await feedChannel.send(`Found in: <#${m.channelId}>\n\nAn Ornate ${tierString} amity has been found at UTC ${utc} by ${m.member.displayName} at **${amityCode}**! \n\n Bonus #1: **${amity.matchedBonuses[0]}** \n Bonus #2: ${amity.matchedBonuses[1]} \n Bonus #3: ${amity.matchedBonuses[2]} \n\n Malus #1: ${amity.matchedMaluses[0]} \n Malus #2: ${amity.matchedMaluses[1]} \n Malus #3: ${amity.matchedMaluses[2]} \n\n ${couchableString} \n ==`);
              }

            }

          }
        } else return;
      });

      imageCollector.on('end', async collected => {

        interaction.editReply({ content: `This submission on sheet ${weekSheet.title} at UTC ${utc} has ended.\nSubmitted ${amities.length} amities and ${nodes.length} nodes.`, embeds: [], components: []})
          .catch(() => {});
        delete userTable[interaction.user.id];
      })

      const startTime = new Date();
      // While it hasn't been 10 minutes since loop started
      while (new Date() - startTime < 600000) {
        const mainReplyEvent = await mainReply.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button });
        if (mainReplyEvent.customId === 'submissioncancel') {
          await mainReplyEvent.update({content: 'done', embeds: [], components: []});
          return imageCollector.stop();
        } else if (mainReplyEvent.customId === 'editmap') {
          
          await mainReplyEvent.update({ embeds: [embeds.editMap], components: []});
          const edittedMap = await interaction.channel.awaitMessages({filter, max: 1});
          const edittedMapImage = edittedMap.first().attachments.first().attachment;

          embeds.newMap.setImage(edittedMapImage);

          const confirmEditReply = await interaction.editReply({ embeds: [embeds.newMap], components: [row]});
          const editButtonEvent = await confirmEditReply.awaitMessageComponent({filter: i => i.user.id === interaction.user.id, componentType: ComponentType.Button});
          if (editButtonEvent.customId === 'approve') {
            arcanistMapCell.value = edittedMapImage;
            weekSheet.saveUpdatedCells();
            embeds.collectionMode.setImage(edittedMapImage);
            editButtonEvent.update({ embeds: [embeds.collectionMode], components: [finalRow]})
          } else {
            editButtonEvent.update({ embeds: [embeds.collectionMode], components: [finalRow]})
          }
          
        } else console.log('how did this even happen?');
      }
      
    } catch(err) {
      console.log(err);
      // SheetID not provided
      if (!err.config) {
        // return interaction.followUp('Please provide the spreadsheet ID or a link to the spreadsheet!');
      } 
      // Invalid or inaccessible sheetID
      else if (err.config.method == 'get') {
        // return interaction.followUp('The sheet provided was invalid or inaccessible.');
      }
      // Bot does not have edit access on given sheetID
      else if (err.config.method == 'post') {
        // return interaction.followUp("I don't have edit access for that sheet! Please provide edit access to `amityhunter@amityhunter.iam.gserviceaccount.com` and try again!");
      }
      // else return interaction.followUp('unknown error, contact bot owner');
    }
  }
}


