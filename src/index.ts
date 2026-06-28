import 'dotenv/config';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { startScheduler } from './scheduler';
import { genres, getRandom, getUniqueVibe, getUniqueGamingVibe, getUniqueNightEndedVibe, vibeMatchDescriptions, vibeMatchMetrics, excuses, copes, blameResponses, clutchResponses, chokeResponses, mostLikelyResponses, mostLikelyActions } from './content';
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

  if (message.content.toLowerCase().startsWith('!vibecheck')) {
    const help = [
      '**VibeCheck — Command List**',
      '',
      '🎵 **Music & Vibes**',
      '`!randomvibe` — drops a song vibe, find a track that matches it',
      '`!randomgenre` — spins a random music genre',
      '`!vibematch @u1 @u2` — checks the vibe match between two people with a % and description',
      '',
      '🎮 **Gaming**',
      '`!tiltcheck` — gives you a tilt level (1–100) and a gaming vibe',
      '`!lobbyvibes` — checks the current lobby vibe before queuing',
      '`!rolecheck valorant @users` — assigns Valorant roles (Duelist, Initiator, Controller, Sentinel)',
      '`!rolecheck league @users` — assigns League roles (Top, Jungle, Mid, Bot, Support)',
      '`!surrender` — 40% chance the bot just says No.',
      '`!nightended` — end of session send-off vibe',
      '',
      '👥 **Group & Team**',
      '`!carrycheck @users` — randomly picks who\'s carrying tonight',
      '`!scrim @users` — splits everyone into two random teams',
      '`!mvp @users` — crowns a random MVP, it wasn\'t close',
      '`!votekick @user` — officially votekicks someone, unanimous, nothing personal',
      '`!mostlikely @users [action]` — picks who\'s most likely to do something, action is optional',
      '`!beef @u1 @u2` — settles a 1v1, the bot has spoken, no appeals',
      '`!blame @user` — officially assigns blame for the loss, binding',
      '`!clutchor @user` — decides if someone clutches or chokes',
      '',
      '😅 **Post-Game**',
      '`!excuse` — generates a certified excuse for the loss',
      '`!cope` — drops a cope statement for after a rough session',
      '',
      '🎲 **Utility**',
      '`!wheel option1, option2, ...` — spins a wheel between any options you give it',
      '`!cr` — cross-reference a song (reply to a message)',
      'Song of the Day — auto-posts daily, a genre + song vibe for the server',
    ].join('\n');
    message.reply(help);
    return;
  }

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
      message.reply('Give me at least 2 options to spin on, separated by commas. Example: `!wheel Valorant, League, Repo`');
      return;
    }

    const choice = getRandom(options);
    message.reply(`🎡 The wheel landed on: **${choice}**`);
  }

  if (message.content.toLowerCase().startsWith('!randomvibe')) {
    const { vibe, cycleComplete } = getUniqueVibe();
    const prefix = cycleComplete ? '*(all vibes cycled — starting fresh!)*\n' : '';
    message.reply(`${prefix}Give me a song with this vibe: **${vibe}**`);
  }

  if (message.content.toLowerCase().startsWith('!carrycheck')) {
    const users = [...message.mentions.users.values()];
    if (users.length < 2) {
      message.reply('Mention at least 2 people. Example: `!carrycheck @Rayyd @Kelly`');
      return;
    }
    const carry = getRandom(users);
    message.reply(`Tonight's carry: **${carry.displayName}**. No pressure. All pressure.`);
  }

  if (message.content.toLowerCase().startsWith('!scrim')) {
    const users = [...message.mentions.users.values()];
    if (users.length < 2) {
      message.reply('Mention at least 2 people to split into teams. Example: `!scrim @u1 @u2 @u3 @u4`');
      return;
    }
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    const team1 = shuffled.slice(0, mid).map(u => u.displayName).join(', ');
    const team2 = shuffled.slice(mid).map(u => u.displayName).join(', ');
    const note = users.length % 2 !== 0 ? '\n*(odd number — team 1 gets the extra)*' : '';
    message.reply(`**Team 1:** ${team1}\n**Team 2:** ${team2}${note}`);
  }

  if (message.content.toLowerCase().startsWith('!mvp')) {
    const users = [...message.mentions.users.values()];
    if (users.length < 2) {
      message.reply('Mention at least 2 people to pick an MVP. Example: `!mvp @u1 @u2 @u3`');
      return;
    }
    const mvp = getRandom(users);
    message.reply(`Tonight's MVP: **${mvp.displayName}**. It wasn't close.`);
  }

  if (message.content.toLowerCase().startsWith('!votekick')) {
    const users = [...message.mentions.users.values()];
    if (users.length === 0) {
      message.reply('Mention someone to votekick. Example: `!votekick @Rayyd`');
      return;
    }
    const target = users[0];
    message.reply(`The server has voted to kick **${target.displayName}**. Unanimous. Nothing personal.`);
  }

  if (message.content.toLowerCase().startsWith('!vibematch')) {
    const users = [...message.mentions.users.values()];
    if (users.length !== 2) {
      message.reply('Mention exactly 2 people. Example: `!vibematch @u1 @u2`');
      return;
    }
    const pct = Math.floor(Math.random() * 100) + 1;
    const metric = getRandom(vibeMatchMetrics);
    const description = getRandom(vibeMatchDescriptions);
    message.reply(`**${users[0].displayName}** & **${users[1].displayName}** — **${pct}% ${metric}**\n*${description}*`);
  }

  if (message.content.toLowerCase().startsWith('!lobbyvibes')) {
    const vibe = getUniqueGamingVibe().vibe;
    message.reply(`Lobby vibe check: *${vibe}*`);
  }

  if (message.content.toLowerCase().startsWith('!nightended')) {
    const { vibe, cycleComplete } = getUniqueNightEndedVibe();
    const prefix = cycleComplete ? '*(all night vibes cycled — starting fresh!)*\n' : '';
    message.reply(`${prefix}Tonight's vibe: *${vibe}*`);
  }

  if (message.content.toLowerCase().startsWith('!rolecheck')) {
    const lower = message.content.toLowerCase();
    const users = [...message.mentions.users.values()];

    let roles: string[];
    let game: string;

    if (lower.includes('valorant') || lower.includes('val')) {
      roles = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
      game = 'Valorant';
    } else if (lower.includes('league') || lower.includes('lol')) {
      roles = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'];
      game = 'League of Legends';
    } else {
      message.reply('Specify a game: `!rolecheck valorant @u1 @u2` or `!rolecheck league @u1 @u2`');
      return;
    }

    if (users.length === 0) {
      message.reply(`Mention the players to assign. Example: \`!rolecheck ${game.toLowerCase()} @u1 @u2\``);
      return;
    }

    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
    const lines = users.map((user, i) => `**${user.displayName}** → ${shuffledRoles[i % shuffledRoles.length]}`);
    message.reply(`**${game} Role Check:**\n${lines.join('\n')}`);
  }

  if (message.content.toLowerCase().startsWith('!tiltcheck')) {
    const level = Math.floor(Math.random() * 100) + 1;
    const vibe = getUniqueGamingVibe().vibe;
    message.reply(`Tilt level: **${level}/100** — ${vibe}`);
  }

  if (message.content.toLowerCase().startsWith('!surrender')) {
    if (Math.random() < 0.6) {
      message.reply('**No.**');
    } else {
      const vibe = getUniqueGamingVibe().vibe;
      message.reply(`Session vibe says: *${vibe}*`);
    }
  }

  if (message.content.toLowerCase().startsWith('!mostlikely')) {
    const users = [...message.mentions.users.values()];
    if (users.length === 0) {
      message.reply('Mention at least 1 person. Example: `!mostlikely @u1 @u2 to int round 1`');
      return;
    }
    const action = message.content.slice('!mostlikely'.length).replace(/<@!?\d+>/g, '').trim() || getRandom(mostLikelyActions);
    const picked = getRandom(users);
    const response = getRandom(mostLikelyResponses)
      .replace(/{name}/g, `**${picked.displayName}**`)
      .replace(/{action}/g, action);
    message.reply(response);
  }

  if (message.content.toLowerCase().startsWith('!beef')) {
    const users = [...message.mentions.users.values()];
    if (users.length !== 2) {
      message.reply('Mention exactly 2 people. Example: `!beef @u1 @u2`');
      return;
    }
    const winner = getRandom(users);
    const loser = users.find(u => u.id !== winner.id)!;
    message.reply(`**${winner.displayName}** wins the 1v1. **${loser.displayName}** doesn't want to hear it but the bot has spoken.`);
  }

  if (message.content.toLowerCase().startsWith('!blame')) {
    const users = [...message.mentions.users.values()];
    if (users.length === 0) {
      message.reply('Mention someone to blame. Example: `!blame @u1`');
      return;
    }
    const target = users[0];
    const blameMsg = getRandom(blameResponses).replace(/{name}/g, `**${target.displayName}**`);
    message.reply(blameMsg);
  }

  if (message.content.toLowerCase().startsWith('!clutchor')) {
    const users = [...message.mentions.users.values()];
    if (users.length === 0) {
      message.reply('Mention someone to decide their fate. Example: `!clutchor @u1`');
      return;
    }
    const target = users[0];
    if (Math.random() < 0.5) {
      const clutchMsg = getRandom(clutchResponses).replace(/{name}/g, `**${target.displayName}**`);
      message.reply(clutchMsg);
    } else {
      const chokeMsg = getRandom(chokeResponses).replace(/{name}/g, `**${target.displayName}**`);
      message.reply(chokeMsg);
    }
  }

  if (message.content.toLowerCase().startsWith('!excuse')) {
    message.reply(`**Excuse:** ${getRandom(excuses)}`);
  }

  if (message.content.toLowerCase().startsWith('!cope')) {
    message.reply(getRandom(copes));
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
