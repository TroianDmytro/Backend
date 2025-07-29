"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
async function testConnection() {
    try {
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Успешное подключение к MongoDB!');
        const TestSchema = new mongoose.Schema({
            name: String,
            date: { type: Date, default: Date.now }
        });
        const TestModel = mongoose.model('Test', TestSchema);
        const testDoc = new TestModel({ name: 'test_connection' });
        await testDoc.save();
        console.log('Тестовый документ успешно создан!');
        await TestModel.deleteOne({ name: 'test_connection' });
        console.log('Тестовый документ успешно удален!');
    }
    catch (error) {
        console.error('Ошибка при подключении к MongoDB:', error);
    }
    finally {
        await mongoose.disconnect();
        console.log('Соединение с MongoDB закрыто');
    }
}
testConnection();
//# sourceMappingURL=test-db-connection.js.map