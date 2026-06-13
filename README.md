# VibeCheck

A Discord bot that posts a **Song of the Day** prompt every morning at 9:00 AM ET. Each post includes a randomly selected genre and mood, inviting your server to share a track that fits both. Posts daily at 8:00 AM ET.

### Commands
- !randomgenre: Generate a random genre on command
- !randomvibe: Generate a random vibe on command
- !cr: When replying to a message with a track URL will generate a message that shows corresponding streaming platform track URLs (does not work for youtube links!)

---

## 1. Create the Discord Bot & Get the Token

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**, name it `VibeCheck`, and hit **Create**.
3. In the left sidebar, go to **Bot**.
4. Click **Add Bot** → **Yes, do it!**
5. Under the bot's username, click **Reset Token** and copy it. This is your `DISCORD_TOKEN`.
6. Scroll down to **Privileged Gateway Intents** — no extra intents are needed for this bot.
7. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `View Channels`
8. Copy the generated URL, open it in your browser, and invite the bot to your server.

---

## 2. Get the Channel ID

1. In Discord, open **User Settings → Advanced** and enable **Developer Mode**.
2. Right-click the channel where you want daily posts and click **Copy Channel ID**.
3. This is your `CHANNEL_ID`.

---

## 3. Set Up the `.env` File

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_TOKEN=your-bot-token-here
CHANNEL_ID=your-channel-id-here
BEAT_KEY="api-key-for-bridge-beat"
```

---

### 3.a Digression on Bridge Beat
[Bridge Beat](https://bridgebeats.link/) is a website was found to assist in converting track URIs from one streaming platform to another so that all users of different platforms can enjoy the experience. This was mainly done because Apple Music doesn't allow people to use their Music APIs for free (boooooooo booo! $99s Boooo! Small indie company so poor boo!). Bridge Beat is free but with a rate limit of 20 requests per hour (YAY! Lovely). They have their own discord bot that does this exact function that you can use if you want. To get an api key go to the website and select register. 

### 3.b Spotify
Spotify helper was added but is not currently used. If needed .env will need to include two more values for the spotify api client_id and secret

## 4. Build and Run with Docker

### Build the image

```bash
docker build -t vibecheck .
```

### Run the container

```bash
docker run -d \
  --name vibecheck \
  --restart unless-stopped \
  --env-file .env \
  vibecheck
```

The `--restart unless-stopped` flag keeps the bot running across NAS reboots.

### Check logs

```bash
docker logs -f vibecheck
```

---

## 5. Deploy on Your Ugreen DXP4800 (UGOS Pro)

### Option A — Portainer (recommended for one-off containers)

1. Open **Portainer** on your DXP4800.
2. Go to **Containers → Add Container**.
3. Fill in:
   - **Name:** `vibecheck`
   - **Image:** `vibecheck` (after building locally and pushing, or build directly on the NAS — see below)
   - **Restart policy:** Unless stopped
4. Under **Env**, add:
   - `DISCORD_TOKEN` = your token
   - `CHANNEL_ID` = your channel ID
5. Click **Deploy the container**.

#### Building on the NAS directly

If you'd rather build on the NAS instead of transferring an image:

1. SCP the project folder to your NAS (e.g. `/volume1/docker/vibecheck/`).
2. SSH into the NAS and run:

```bash
cd /volume1/docker/vibecheck
docker build -t vibecheck .
```

Then deploy via Portainer as above.

---

### Option B — Docker Compose

Create a `docker-compose.yml` on your NAS (e.g. at `/volume1/docker/vibecheck/docker-compose.yml`):

```yaml
services:
  vibecheck:
    image: vibecheck
    container_name: vibecheck
    restart: unless-stopped
    env_file:
      - .env
```

Place your `.env` file in the same directory, then run:

```bash
docker compose up -d
```

In Portainer you can also import this as a **Stack** — go to **Stacks → Add Stack**, paste the compose file, and add your env vars in the environment section.

---

## Development (local, without Docker)

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

To compile and run the production build locally:

```bash
npm run build
npm start
```
