// bot.js - Bot that connects and continuously moves in a circle.

const mineflayer = require('mineflayer');

// --- Configuration ---
// DIRECT VALUES: Hardcoded server and bot details based on user input.
const HOST = 'Beliver_SMP.aternos.me';
const PORT = 59264;
const USERNAME = 'Belbot';
const PASSWORD = process.env.MC_PASSWORD || 'Belbot'; 
const VERSION = '1.12.1'; 

// CIRCLE CONFIGURATION
// To run in a circle, the bot must hold 'forward' and 'turn left'/'turn right'.
// Adjusting the TURN_SPEED (delay) changes the circle's radius.
const TURN_SPEED = 50; // Milliseconds between control state changes (controls radius/speed)

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
    function startCircling() {
        console.log(`Starting constant forward movement and turning left to form a circle.`);
        console.log(`NOTE: The combination of 'forward' and 'left' makes the bot circle.`);

        // 1. Set Forward Control (Move)
        bot.setControlState('forward', true);
        
        // 2. Set Left Control (Turn)
        // By setting both true, the bot will run in a circle.
        bot.setControlState('left', true);

        // NOTE: We don't need a loop (like setInterval) here, 
        // as setControlState(true) keeps the key pressed indefinitely.
    }

    // --- Event Handlers ---
    bot.on('login', () => {
        console.log(`\n🎉 Bot connected successfully! Logged in as: ${bot.username}`);
        
        // Start the circular movement 5 seconds after login.
        setTimeout(startCircling, 5000); 
    });

    bot.on('kicked', (reason) => {
        console.error(`\n💥 KICKED! Reason: ${reason}`);
        console.log('Attempting to reconnect in 5 seconds...');
        // bot.end() should trigger the 'end' handler which restarts the bot
        bot.end(); 
    });

    bot.on('error', (err) => {
        console.error(`\n❌ Bot Error: ${err.message}`);
    });

    bot.on('end', () => {
        console.log('\n🛑 Bot disconnected. Reconnecting in 5 seconds...');
        // Crucial: Clear controls before reconnecting attempt
        if (bot && bot.controlState) {
            bot.setControlState('forward', false);
            bot.setControlState('left', false);
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
