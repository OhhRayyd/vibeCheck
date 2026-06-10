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
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is not set. Exiting.');
  process.exit(1);
}

client.login(token);
