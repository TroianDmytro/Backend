// scripts/wait-for-mongo.js
const { MongoClient } = require('mongodb');
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

// Получаем MongoDB URI из переменной окружения
const mongoUri = process.env.MONGODB_URI ||
    'mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/';

console.log('🔄 Проверка подключения к MongoDB...');
console.log(`📍 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

async function waitForMongo() {
    const maxRetries = 30;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const client = new MongoClient(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 5000
            });

            await client.connect();
            console.log('✅ MongoDB доступна!');
            await client.close();
            return;
        } catch (error) {
            retries++;
            console.log(`⏳ Попытка ${retries}/${maxRetries}: MongoDB недоступна, повтор через 2 секунды...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.error('❌ Не удалось подключиться к MongoDB');
    process.exit(1);
}

waitForMongo().catch(console.error);