// === Minecraft AFK Bot (Mineflayer + Express) ===
// Keeps your server online 24/7 when hosted on Replit

const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

// --- CONFIGURATION ---
const HOST = process.env.MC_HOST || 'your.server.ip'; // e.g. play.example.com
const PORT_MC = parseInt(process.env.MC_PORT || '25565', 10);
const BOT_NAME = process.env.BOT_NAME || 'AFK_Bot'; // Name for the bot
const REPL_PORT = process.env.PORT || 3000;

// --- BOT CREATION & RECONNECT HANDLER ---
let bot;
let reconnectDelay = 5000; // 5 seconds

function createBot() {
  console.log(`Connecting to ${HOST}:${PORT_MC} as ${BOT_NAME}`);

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT_MC,
    username: BOT_NAME,
  });

  bot.once('spawn', () => {
    console.log('✅ Bot joined the server successfully!');

    // Simple anti-AFK movement (jump every 60 seconds)
    setInterval(() => {
      try {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 200);
      } catch (err) {
        console.error('Movement error:', err);
      }
    }, 60 * 1000);
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err.message);
  });

  bot.on('kicked', (reason) => {
    console.warn('Bot was kicked:', reason);
    scheduleReconnect();
  });

  bot.on('end', (reason) => {
    console.warn('Bot disconnected:', reason);
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  console.log(`Reconnecting in ${reconnectDelay / 1000} seconds...`);
  setTimeout(createBot, reconnectDelay);
}

// Start bot
createBot();

// --- EXPRESS KEEP-ALIVE WEB SERVER ---
app.get('/', (req, res) => {
  res.send('✅ Minecraft AFK Bot is running and connected!');
});

app.listen(REPL_PORT, '0.0.0.0', () => {
  console.log(`🌐 Keep-alive web server started on port ${REPL_PORT}`);
});
