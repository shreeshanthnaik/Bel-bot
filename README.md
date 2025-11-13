# Simple Forward-Walking Minecraft Bot Deployment (GitHub & Heroku)

This bot is designed to log in and **simultaneously hold the 'W' key (forward movement)** indefinitely. This setup relies on the bot being placed in **Spectator Mode** manually by a server administrator, as it does not use complex pathfinding or physics.

## Setup Steps

### 1. File Preparation
Create a folder named `mc-forward-bot` and place the four files (`bot.js`, `package.json`, `Procfile`, `README.md`) inside it.

### 2. GitHub Initialization
Initialize a Git repository and push the files to GitHub:

```bash
git init
git add .
git commit -m "Initial commit for forward-flying bot"
git branch -M main
git remote add origin [<YOUR_GITHUB_REPO_URL>](https://github.com/shreeshanthnaik/Bel-bot)
git push -u origin main
