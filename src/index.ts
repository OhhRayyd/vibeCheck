import 'dotenv/config';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { startScheduler } from './scheduler';
import { genres, moods, getRandom } from './content';
import { getTrackURLs } from './cross-reference';

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

  if (message.content.toLowerCase().startsWith('!randomvibe')) {
    const mood = getRandom(moods);
    message.reply(`Give me a song with this vibe: **${mood}**`);
  }

  // if a message is a reply to another message and we have the commend !cr
  if(message.type === 19 && message.content.toLowerCase().startsWith('!cr')){
    getTrackURLs(message)
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is not set. Exiting.');
  process.exit(1);
}

client.login(token);
