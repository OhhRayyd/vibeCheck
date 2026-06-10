import cron from 'node-cron';
import { Client } from 'discord.js';
import { postSongOfTheDay } from './postSongOfTheDay';

export function startScheduler(client: Client): void {
  // Fires at 8:00 AM every day, America/New_York timezone
  cron.schedule(
    '0 8 * * *',
    async () => {
      console.log(`[${new Date().toISOString()}] Running Song of the Day scheduler...`);
      try {
        await postSongOfTheDay(client);
      } catch (err) {
        console.error('Failed to post Song of the Day:', err);
      }
    },
    {
      timezone: 'America/New_York',
    }
  );

  console.log('Scheduler started — Song of the Day will post at 8:00 AM ET daily.');
}
