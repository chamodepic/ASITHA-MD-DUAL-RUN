const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BOT_FOLDERS = ['bot1', 'bot2'];
const DELAY_TIME = 60000;

async function startFinalSystem() {

    for (let i = 0; i < BOT_FOLDERS.length; i++) {

        const folder = BOT_FOLDERS[i];
        const folderPath = path.join(__dirname, folder);

        console.log(`\n--- 🛠️ Processing ${folder.toUpperCase()} ---`);

        // 1️⃣ Install dependencies properly (blocking)
        if (!fs.existsSync(path.join(folderPath, 'node_modules'))) {
            console.log(`📦 Installing modules in ${folder}...`);
            try {
                execSync('npm install', { cwd: folderPath, stdio: 'inherit' });
            } catch (err) {
                console.log(`❌ Install failed for ${folder}`);
                continue;
            }
        }

        // 2️⃣ Start bot
        console.log(`🚀 Starting ${folder} using npm start...`);

        try {
            execSync('npm start', {
                cwd: folderPath,
                stdio: 'inherit',
                env: {
                    ...process.env,
                    PORT: (8000 + i).toString()
                }
            });
        } catch (err) {
            console.log(`❌ Failed to start ${folder}`);
            continue;
        }

        // 3️⃣ Delay between bots
        if (i < BOT_FOLDERS.length - 1) {
            console.log(`⏳ Waiting 60s...`);
            await new Promise(res => setTimeout(res, DELAY_TIME));
        }
    }

    console.log(`\n✅ ALL BOTS STARTED VIA NPM.`);
}

startFinalSystem();
