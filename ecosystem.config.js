module.exports = {
  apps: [
    {
      name: 'Wyzth',
      script: 'src/index.js',
      log: './logs/combined.outerr.log',
      error_file: './logs/error.log',
      watch: true,
      ignore_watch: ['logs/*', 'downloads/*'],
      env_staging: {
        NODE_ENV: 'staging',
        NODE_APP_INSTANCE: 'Wyzth',
      },
      env_production: {
        NODE_ENV: 'production',
        NODE_APP_INSTANCE: 'Wyzth',
      },
    },
  ],
};
