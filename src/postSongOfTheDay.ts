import { Client, TextChannel } from 'discord.js';
import { genres, moods, getRandom } from './content';

export async function postSongOfTheDay(client: Client): Promise<void> {
  const channelId = process.env.CHANNEL_ID;
  if (!channelId) {
    console.error('CHANNEL_ID is not set in environment variables.');
    return;
  }

  const channel = await client.channels.fetch(channelId);
  if (!channel || !(channel instanceof TextChannel)) {
    console.error(`Channel ${channelId} not found or is not a text channel.`);
    return;
  }

  const genre = getRandom(genres);
  const mood = getRandom(moods);

  const message = [
    '🎵 **Song of the Day**',
    '',
    `**Genre:** ${genre}`,
    `**Mood:** ${mood}`,
    '',
    'Drop a track that fits both. Bonus points if it nails the vibe. 🎶',
  ].join('\n');

  await channel.send(message);
  console.log(`[${new Date().toISOString()}] Posted Song of the Day — Genre: ${genre}`);
}
