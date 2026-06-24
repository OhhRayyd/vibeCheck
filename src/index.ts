import 'dotenv/config';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { startScheduler } from './scheduler';
import { genres, getRandom } from './content';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
  startScheduler(client);
});

client.on('messageCreate', (message: Message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith('!randomgenre')) {
    const genre = getRandom(genres);
    message.reply(`Here's a random genre: **${genre}**`);
  }

  if (message.content.toLowerCase().startsWith('!wheel')) {
    const options = message.content
      .slice('!wheel'.length)
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length < 2) {
      message.reply('Give me at least 2 options to spin on, separated by commas. Example: `!wheel Valorant, Minecraft, Apex`');
      return;
    }

    const choice = getRandom(options);
    message.reply(`🎡 The wheel landed on: **${choice}**`);
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is not set. Exiting.');
  process.exit(1);
}

client.login(token);
