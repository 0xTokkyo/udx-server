module.exports = {
  apps: [
    {
      name: 'udx-server',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        SERVER_PORT: 3004
      },
      env_production: {
        NODE_ENV: 'production',
        SERVER_PORT: 3004
      },
      error_file: './logs/server/err.log',
      out_file: './logs/server/out.log',
      log_file: './logs/server/combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
    },
    {
      name: 'udx-backup',
      script: './tasks/backup.sh',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        DB_FILE_NAME: 'udx.db'
      },
      env_production: {
        DB_FILE_NAME: 'udx.db'
      },
      cron_restart: '0 2 * * *', // 02:00 AM every day
      autorestart: false,
      error_file: './logs/backup/err.log',
      out_file: './logs/backup/out.log',
      log_file: './logs/backup/combined.log',
      time: true
    }
  ]
}
