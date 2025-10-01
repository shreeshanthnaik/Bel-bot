// bot.js - Bot that connects and continuously cycles through WASD controls.

const mineflayer = require('mineflayer');

// --- Configuration ---
// DIRECT VALUES: Hardcoded server and bot details based on user input.
const HOST = 'Beliver_SMP.aternos.me';
const PORT = 59264;
const USERNAME = 'Belbot';
const PASSWORD = process.env.MC_PASSWORD || 'Belbot'; 
const VERSION = '1.12.1'; 

// MOVEMENT SEQUENCE CONFIGURATION
// Time (in milliseconds) the bot spends on each control (W, A, S, or D).
// Reduced to 500ms (0.5 seconds) to create a very tight, 1-block radius cycle.
const STEP_DURATION = 500; // 0.5 second per direction (W, A, S, D)

// The sequence of controls to cycle through: Forward, Left, Backward, Right
const MOVEMENT_SEQUENCE = ['forward', 'left', 'back', 'right'];

let bot;
let moveInterval = null;
let currentStep = 0;

function createBot() {
    console.log(`Attempting to connect to ${HOST}:${PORT} as ${USERNAME} (Version: ${VERSION})...`);
    bot = mineflayer.createBot(botOptions);

    // --- Bot Utility Functions ---

    // Function to clear all current control states (stop movement)
    function clearAllControls() {
        if (bot) {
            MOVEMENT_SEQUENCE.forEach(control => bot.setControlState(control, false));
        }
    }

    // Function to execute the next step in the WASD sequence
    function cycleMovement() {
        // 1. Clear previous control
        clearAllControls();

        // 2. Determine the control for the current step (W, A, S, or D)
        const controlToSet = MOVEMENT_SEQUENCE[currentStep];

        // 3. Set the new control state (Hold the button)
        if (bot) {
            bot.setControlState(controlToSet, true);
            console.log(`[Movement] -> Set control: ${controlToSet}`);
        }

        // 4. Move to the next step index for the next cycle
        currentStep = (currentStep + 1) % MOVEMENT_SEQUENCE.length;
    }


    // --- Core Startup Function ---
    function startWasdCycle() {
        console.log(`Starting WASD movement cycle. Changing direction every ${STEP_DURATION / 1000} seconds.`);

        // Start the cycle immediately
        cycleMovement();

        // Start the timed interval loop to switch controls
        moveInterval = setInterval(cycleMovement, STEP_DURATION);
    }


    // --- Event Handlers ---
    bot.on('login', () => {
        console.log(`\n🎉 Bot connected successfully! Logged in as: ${bot.username}`);
        
        // Start the WASD sequence 5 seconds after login.
        setTimeout(startWasdCycle, 5000); 
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
        
        // Clear the interval loop when disconnecting
        if (moveInterval) {
            clearInterval(moveInterval);
            moveInterval = null;
        }

        // Clear controls
        clearAllControls();
        
        setTimeout(createBot, 5000);
    });
}

const botOptions = {
    host: HOST,
    port: PORT,
    username: USERNAME,
    password: PASSWORD,
    version: VERSION,
    hideErrors: false,
};

createBot();

process.on('SIGINT', () => {
    console.log('Bot shutting down...');
    if (bot) {
        bot.end();
    }
    process.exit(0);
});
