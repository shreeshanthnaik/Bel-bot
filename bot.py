// bot.js - Simple bot that connects and holds the 'forward' control state (W).

const mineflayer = require('mineflayer');

// --- Configuration ---
// Read connection details from Heroku Environment Variables
const HOST = process.env.Beliver_SMP.aternos.me;
const PORT = parseInt(process.env.59264 || '25565');
const USERNAME = process.env.Belbot;
const PASSWORD = process.env.Belbot;
const VERSION = process.env.1.12.1 || false;

// Target coordinates read for reference/logging only
const TARGET_X = process.env.10000;
const TARGET_Z = process.env.-50000;

if (!HOST || !USERNAME) {
    console.error("FATAL ERROR: MC_HOST and MC_USERNAME environment variables must be set.");
    process.exit(1);
}

const botOptions = {
    host: HOST,
    port: PORT,
    username: USERNAME,
    password: PASSWORD,
    version: VERSION,
    hideErrors: false,
};

let bot;

function createBot() {
    console.log(`Attempting to connect to ${HOST}:${PORT} as ${USERNAME}...`);
    bot = mineflayer.createBot(botOptions);

    // --- Bot Functions ---
    function startWalking() {
        console.log(`Starting constant 'W' press.`);
        console.log(`NOTE: Bot assumes you have manually set its gamemode to SPECTATOR and oriented it towards X: ${TARGET_X}, Z: ${TARGET_Z}.`);

        // Set the 'forward' control state to true immediately and keep it true.
        bot.setControlState('forward', true);
        
        // Chat a confirmation message on the server
        bot.chat(`I am now holding 'W' and flying towards the target area.`);
    }

    // --- Event Handlers ---
    bot.on('login', () => {
        console.log(`\n🎉 Bot connected successfully! Logged in as: ${bot.username}`);
        
        // Start the simple walking behavior 5 seconds after login.
        setTimeout(startWalking, 5000); 
    });

    bot.on('kicked', (reason) => {
        console.error(`\n💥 KICKED! Reason: ${reason}`);
        console.log('Attempting to reconnect in 10 seconds...');
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        console.error(`\n❌ Bot Error: ${err.message}`);
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            console.error('Connection failed. Retrying in 10 seconds...');
            bot.end();
            setTimeout(createBot, 10000);
        }
    });

    bot.on('end', () => {
        console.log('\n🛑 Bot disconnected. Reconnecting in 5 seconds...');
        // Crucial: Clear the forward state before reconnecting attempt
        if (bot) {
            bot.setControlState('forward', false);
        }
        setTimeout(createBot, 5000);
    });
}

createBot();

process.on('SIGINT', () => {
    console.log('Bot shutting down...');
    if (bot) {
        bot.end();
    }
    process.exit(0);
});