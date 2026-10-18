// PM2 process definition for the production server.
// Start: pm2 start ecosystem.config.cjs   (port 5011, see Caddyfile)
module.exports = {
  apps: [
    {
      name: "ailourl",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5011",
      env: { NODE_ENV: "production" },
      max_memory_restart: "400M",
    },
  ],
};
