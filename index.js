const { CronJob } = require('cron');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config/config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const db = require('./models');
const runSheetSummaries = require("./functions/runSheetSummaries");
const loadSpreadsheet = require("./functions/loadSpreadsheet");

// Initialize the sheets Map
const sheets = new Map();

const userTable = {};

// Load commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// On "ready" event, load all sheets simultaneously
client.once(Events.ClientReady, async () => {
	console.log('Bot is ready!');
	await runSheetSummaries(client, sheets);
	// delete db channels that the bot can't find
	// const submissionChannels = await db.Channel.findAll();
	// 	for (const channel of submissionChannels) {
	// 		try {
	// 			const guild = client.guilds.cache.get(channel.GuildId);
	// 			const guildChannel = await guild.channels.fetch(channel.id);
	// 			if (guildChannel) continue;
	// 		} catch(err) {
	// 			console.log(err);
	// 			await db.Channel.destroy({ where: { id: channel.id}});
	// 		}
	// 	}

	const job = new CronJob(
		'0 * * * *', // Every hour on the hour
		async function() {
			await reloadSheets();
			await runSheetSummaries(client, sheets);
		},
		null,
		true,
		'America/New_York'
	);
    
});

// Handle interactions (e.g., slash commands)
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	const guild = await db.Guild.findByPk(interaction.guildId);
	if (guild) if (!guild.whitelisted) return await interaction.deferReply();
	if (!guild) return await interaction.deferReply();

	if (!command) return;

	// Duplicate submit command
	if (interaction.commandName === 'submit' && interaction.user.id in userTable) {
		if (new Date() - userTable[interaction.user.id].timestamp < 605000)
			userTable[interaction.user.id].collector.stop();
	}

	try {
		await command.execute(interaction, userTable, sheets);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Sync database and login
db.sequelize.sync({ force: false }).then(async () => {
	await reloadSheets();
	console.log(`Sheets loaded: ${sheets.size}`);
  client.login(token);
});

function delay(seconds) {
	return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// util for below.. google gets mad when we load ~30 sheets within a minute. split array into chunks of 25
function chunkArray(array, size = 25) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function reloadSheets() {
	console.log('Reloading sheets...');

	try {
		// Fetch all unique sheetIds
		const initialTimestamp = Date.now();
		const submissionChannels = await db.Channel.findAll();
		const sheetIds = [...new Set(submissionChannels.map(sc => sc.sheetId))];

		const pLimit = (await import('p-limit')).default;
		const limit = pLimit(1);

		// Cache all sheets in the sheets Map
		// Rewrote loadSpreadsheet to retry on error 429, using p-limit to keep concurrency limit of requests at 4 (arbitrary number, might need adjusting)
		const loadPromises = sheetIds.slice(0, 70).map((sheetId) => 
			limit(async () => {
				const doc = await loadSpreadsheet(sheetId);
				sheets.set(sheetId, doc); // Update the Map
				return doc;
			})
		);

		await Promise.all(loadPromises);
		console.log(`Loaded ${loadPromises.length} sheets`);
		console.log(`took this long: ${(initialTimestamp - Date.now()) / 1000 * -1} seconds`);
	} catch (error) {
		console.error('Error in cron job:', error);
	}
}

// Cron job moved to inside the Ready event handler
