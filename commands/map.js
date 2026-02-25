const { SlashCommandBuilder, EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
// const loadSpreadsheet = require('../functions/loadSpreadsheet');
const db = require('../models')

module.exports = {
    data : new SlashCommandBuilder()
        .setName('map')
        .setDescription('View the map for a specific hour.')
        .addNumberOption(option => option.setName('utc').setDescription('Include the UTC time you want to see or, if this is blank, it will be the current time.'))
        ,
    
    async execute(interaction, userTable, sheets){
        try {
            await interaction.deferReply({ephemeral: true});

            let utc;
            const utcOption = interaction.options.get('utc');
            if(!utcOption){
                utc = new Date().getUTCHours();
            } else if (utcOption.value < 0 || utcOption.value > 23) {
                return interaction.editReply('Please input a valid UTC 0-23.');
            } else {
                utc = Math.floor(utcOption.value);
            }
            const dbChannel = await db.Channel.findByPk(interaction.channel.id);
            if (!dbChannel) return interaction.editReply({content: 'This command can only be used in submission channels.', ephemeral: true});
            
            // old code, sheets are cached top-level and accessed via the sheets Map
                // const doc = await loadSpreadsheet(dbChannel.sheetId);

            let doc = sheets.get(dbChannel.sheetId);
            if (!doc) {
                console.log(`Sheet ${dbChannel.sheetId} was not cached.. loading + adding to cache..`);
                doc = await loadSpreadsheet(dbChannel.sheetId);
                sheets.set(dbChannel.id, doc);
            }

            await doc.updateProperties({ title: doc.title });
            const weekSheet = doc.sheetsByIndex[1];

            // old code, weekSheet is loaded at the loadSpreadsheet level now
                // await weekSheet.loadCells();
            
            if (weekSheet.getCell(2, 0).value !== 'Arcanist Map') {
              return interaction.editReply({content: 'Something seems to be wrong with this spreadsheet. Please alert the manager of the sheet.', ephemeral: true});
            }
            console.log("trying to load map cell for " + (utc + 2));
            const arcanistMapCell = weekSheet.getCell(2, utc + 2);
            console.log("Loaded " + arcanistMapCell.value);
            
            if (!arcanistMapCell.value){
                return interaction.editReply({content: 'This hour does not seem to have a map yet!', ephemeral: true});
            } else if (!arcanistMapCell.value.match('https')) return interaction.editReply('I don\'t understand this sheet. Is something weird in the Arcanist Map cell for UTC ' + utc + '?');

            const mapEmbed = new EmbedBuilder()
                .setTitle('Arcanist Map')
                .setDescription('Map for UTC ' + utc)
                .setColor('Blue')
                .setImage(arcanistMapCell.value);
            
            return interaction.editReply({embeds: [mapEmbed], ephemeral: true});
        } catch (e){
            console.log(e);
        }
    }
}