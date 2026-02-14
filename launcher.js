const { fork } = require('child_process');
const path = require('path');
const fs = require('fs').promises; // better with async
const { execSync } = require('child_process');

const BOT_FOLDERS = ['bot1', 'bot2'];
const ENTRY_FILE = 'start.js';           // change if your entry is index.js etc.
const DELAY_MS = 60_000;                 // 60 seconds
const BASE_PORT = 8000;

async function ensureDependencies(folderPath) {
    const modulesPath = path.join(folderPath, 'node_modules');
    if (!(await fs.stat(modulesPath).catch(() => false))) {
        console.log(`📦 Installing dependencies in ${path.basename(folderPath)} ...`);
        try {
            execSync('npm install --production', {
                cwd: folderPath,
                stdio: 'inherit',
                timeout: 300_000 // 5 min max
            });
        } catch (err) {
            console.error(`❌ npm install failed in ${path.basename(folderPath)}`, err.message);
            return false;
        }
    }
    return true;
}

function startBot(folder, index) {
    const folderPath = path.join(__dirname, folder);
    const port = BASE_PORT + index;

    console.log(`\n→ Launching ${folder.toUpperCase()}  (port ${port})`);

    const child = fork(path.join(folderPath, ENTRY_FILE), [], {
        cwd: folderPath,
        env: {
            ...process.env,
            PORT: port.toString(),
            NODE_APP_INSTANCE: index.toString(),
            // Optional: force different session folder if bot supports env var
            // AUTH_DIR: path.join(folderPath, 'auth')
        },
        execArgv: ['--no-warnings'] // cleaner output
    });

    child.on('exit', (code, signal) => {
        console.log(`${folder.toUpperCase()} exited → code ${code} signal ${signal}`);
        // Optional: auto-restart logic
        // setTimeout(() => startBot(folder, index), 10000);
    });

    child.on('error', err => {
        console.error(`${folder.toUpperCase()} errored:`, err);
    });

    return child;
}

async function startAll() {
    console.log("Starting ASITHA-MD multi-bot launcher...\n");

    for (let i = 0; i < BOT_FOLDERS.length; i++) {
        const folder = BOT_FOLDERS[i];
        const folderPath = path.join(__dirname, folder);

        if (!await fs.stat(folderPath).catch(() => false)) {
            console.error(`Folder not found: ${folder}`);
            continue;
        }

        const installed = await ensureDependencies(folderPath);
        if (!installed) continue;

        startBot(folder, i);

        if (i < BOT_FOLDERS.length - 1) {
            console.log(`  ⏳ Waiting ${DELAY_MS/1000}s before next bot...`);
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    console.log(`\n✅ Launcher finished — ${BOT_FOLDERS.length} bots started.`);
}

startAll().catch(err => {
    console.error("Launcher crashed", err);
    process.exit(1);
});
