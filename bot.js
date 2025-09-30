// bot.js - Simple bot that connects and holds the 'forward' control state (W).

const mineflayer = require('mineflayer');

// --- Configuration ---
// DIRECT VALUES: These values are now hardcoded based on the user's request.
const HOST = 'Beliver_SMP.aternos.me';
const PORT = 59264;
const USERNAME = 'Belbot1';
const PASSWORD = process.env.MC_PASSWORD || 'Belbot1'; // Keeping password as optional ENV or direct value
const VERSION = '1.12.1'; // Directly setting the Minecraft version

// Target coordinates read from Render Environment Variables for logging only
const TARGET_X = process.env.TARGET_X;
const TARGET_Z = process.env.TARGET_Z;

// Note: Removed the safety check (!HOST || !USERNAME) since values are hardcoded.

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
    console.log(`Attempting to connect to ${HOST}:${PORT} as ${USERNAME} (Version: ${VERSION})...`);
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
        bot.end(); // Manually end to trigger 'end' event
    });

    bot.on('error', (err) => {
        console.error(`\n❌ Bot Error: ${err.message}`);
        // Log common connection errors and try to restart the bot
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'EHOSTUNREACH') {
            console.error('Connection failed. Retrying in 10 seconds...');
        }
        // bot.end() should ideally be called here but sometimes error triggers 'end' implicitly
    });

    bot.on('end', () => {
        console.log('\n🛑 Bot disconnected. Reconnecting in 5 seconds...');
        // Crucial: Clear the forward state before reconnecting attempt
        if (bot && bot.controlState) {
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
