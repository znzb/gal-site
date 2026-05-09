const https = require('https');

const PING_URL = process.env.RENDER_EXTERNAL_URL || 'https://your-app.onrender.com';

const pingInterval = 14 * 60 * 1000;

const ping = () => {
  console.log(`[${new Date().toISOString()}] Pinging server to prevent cold start...`);
  https.get(PING_URL, (res) => {
    console.log(`[${new Date().toISOString()}] Ping response: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Ping error: ${err.message}`);
  });
};

if (process.env.NODE_ENV === 'production') {
  setInterval(ping, pingInterval);
  console.log(`Cold start prevention active - will ping every ${pingInterval / 60000} minutes`);
}

module.exports = ping;