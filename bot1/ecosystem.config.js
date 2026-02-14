module.exports = {
  apps: [
    {
      name: "ASITHA-MD-BOT1",
      script: "start.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1024M",
      env: {
        NODE_ENV: "production",
        PORT: 8000
      }
    }
  ]
};
