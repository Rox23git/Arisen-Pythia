const db = require('../models');
const getLatestSummary = require("./getLatestSummary");
const loadSpreadsheet = require('./loadSpreadsheet');

async function runSheetSummaries(client, sheets) {
    // Fetch all summary messages that are not deleted
    const summaryMessages = await db.SummaryMessage.findAll({ where: { isDeleted: false } });
    const bonuses = await db.Bonus.findAll();
    // Process all summary messages concurrently
    await Promise.all(summaryMessages.map(async (sm) => {
        try {
            // Fetch the guild from the client's cache


            const guild = client.guilds.cache.get(sm.guildId);
            if (!guild) {
                console.error(`Guild with ID ${sm.guildId} not found`);
                return;
            }

            // Fetch the channel from the guild
            const channel = await guild.channels.fetch(sm.channelId);
            if (!channel) {
                console.error(`Channel with ID ${sm.channelId} not found in guild ${sm.guildId}`);
                return;
            }

            // Fetch the message from the channel
            const msg = await channel.messages.fetch(sm.messageId);
            if (!msg) {
                console.error(`Message with ID ${sm.messageId} not found in channel ${sm.channelId}`);
                return;
            }

            // Get the pre-loaded spreadsheet document from the sheets Map
            let doc = sheets.get(sm.sheetId);
            if (!doc) {
                console.log(`Sheet with ID ${sm.sheetId} not found in cache`);
                doc = await loadSpreadsheet(sm.sheetId);
                sheets.set(sm.sheetId, doc);
                console.log(`Sheet ${sm.sheetId} reloaded + added to cache`);
            }
            if (!doc) return msg.edit('Error loading sheet summary... ' + sm.sheetId);

            // Generate the latest summary using the pre-loaded document
            const summary = await getLatestSummary(doc, bonuses);

            // Update the Discord message with the first element of the summary array

            // temp test code
            // const guild = await client.guilds.cache.get('1054824159273820250');
            // const channel = await guild.channels.fetch('1065406136074899569');
            // await channel.send(summary[0]);

            // Prod code
            await msg.edit(summary[0]);
        } catch (e) {
            console.error(`Error processing summary for message ${sm.messageId}:`, e);
        }
    }));
}

module.exports = runSheetSummaries;