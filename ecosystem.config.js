module.exports = {
  apps: [{
    name: 'siscontevolucion',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
