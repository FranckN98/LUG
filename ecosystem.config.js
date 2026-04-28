// PM2 process file for production on the IONOS VPS.
// Run with:  pm2 start ecosystem.config.js --env production
//            pm2 save && pm2 startup        (to auto-restart at boot)

module.exports = {
  apps: [
    {
      name: 'levelupingermany',
      cwd: '/var/www/levelupingermany/current',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      out_file: '/var/log/levelupingermany/out.log',
      error_file: '/var/log/levelupingermany/err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
