const mineflayer = require('mineflayer');

// --- Configuration ---
const HOST = 'server';
const PORT = 'port';
const USERNAME = 'Bot';
const VERSION = '1.21.1'; // Use 1.21.1 for Java 1.21.x

const STEP_DURATION = 800; // Slightly slower for better stability
const MOVEMENT_SEQUENCE = ['forward', 'left', 'back', 'right'];

let bot;
let moveInterval = null;
let currentStep = 0;

function createBot() {
    console.log(`[System] Connecting to ${HOST}:${PORT} (Ver: ${VERSION})...`);

    bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: USERNAME,
        version: VERSION,
        // These settings help fix the 1.21 protocol/disconnect issues:
        checkTimeoutInterval: 60000, 
        auth: 'offline' 
    });

    // --- Core Functions ---

    function clearAllControls() {
        if (bot && bot.controlState) {
            MOVEMENT_SEQUENCE.forEach(control => bot.setControlState(control, false));
        }
    }

    function cycleMovement() {
        if (!bot.entity) return; // Don't move if not spawned
        
        clearAllControls();
        const controlToSet = MOVEMENT_SEQUENCE[currentStep];
        bot.setControlState(controlToSet, true);
        
        // Add a random arm swing to look more "human" to Aternos
        bot.swingArm('right'); 
        
        currentStep = (currentStep + 1) % MOVEMENT_SEQUENCE.length;
    }

    // --- Event Handlers ---

    bot.on('spawn', () => {
        console.log('✅ Bot spawned in the world!');
        
        // Wait 3 seconds after spawning before moving to avoid "Internal Server Error"
        setTimeout(() => {
            if (!moveInterval) {
                console.log('🚀 Starting AFK movement cycle...');
                moveInterval = setInterval(cycleMovement, STEP_DURATION);
            }
        }, 3000);
    });

    bot.on('error', (err) => {
        console.error('❌ Bot Error:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.log('👉 Tip: Is your Aternos server actually ONLINE?');
        }
    });

    bot.on('kicked', (reason) => {
        console.warn('⚠️ Bot was kicked. Reason:', reason);
    });

    bot.on('end', () => {
        console.log('🛑 Connection lost. Reconnecting in 15 seconds...');
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = null;
        setTimeout(createBot, 15000); // Auto-reconnect enabled for Aternos stability
    });
}

createBot();

// Handle Ctrl+C safely
process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    if (bot) bot.end();
    process.exit(0);
});
