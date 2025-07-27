//healthcheck.js
const http = require('http');
const fs = require('fs');

// Функция чтения секрета
function getSecret(secretName, envVar, defaultValue) {
    try {
        const secretPath = `/run/secrets/${secretName}`;
        if (fs.existsSync(secretPath)) {
            return fs.readFileSync(secretPath, 'utf8').trim();
        }
    } catch (error) {
        console.warn(`Warning: Could not read secret ${secretName}`);
    }

    return process.env[envVar] || defaultValue;
}

const port = process.env.PORT || 8001;
const nodeEnv = process.env.NODE_ENV || 'development';

const options = {
    host: 'localhost',
    port: port,
    path: '/api',
    timeout: 5000,
    method: 'GET',
    headers: {
        'User-Agent': 'Docker-Healthcheck/1.0'
    }
};

console.log(`[${new Date().toISOString()}] Health check started for port ${port} (${nodeEnv})`);

const request = http.request(options, (res) => {
    console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);

    if (res.statusCode === 200) {
        console.log(`[${new Date().toISOString()}] ✅ Health check passed`);
        process.exit(0);
    } else {
        console.log(`[${new Date().toISOString()}] ❌ Health check failed - unexpected status`);
        process.exit(1);
    }
});

request.on('error', (err) => {
    console.log(`[${new Date().toISOString()}] ❌ Health check failed - error: ${err.message}`);
    process.exit(1);
});

request.on('timeout', () => {
    console.log(`[${new Date().toISOString()}] ❌ Health check failed - timeout`);
    request.destroy();
    process.exit(1);
});

request.setTimeout(options.timeout);
request.end();