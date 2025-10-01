module.exports = {
  apps: [{
    name: 'Belbot',
    script: 'bot.js',
    watch: false,
    exec_mode: 'fork',
    instances: 1,
    cwd: '.', // Use the current working directory (where this config file is)
    out_file: '/home/shree/Bel-bot/Belbot-out.log',
    error_file: '/home/shree/Bel-bot/Belbot-err.log',
    env: {
      "NODE_ENV": "production"
    }
  }]
};
