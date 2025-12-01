"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAdminCredentials = generateAdminCredentials;
exports.hashPassword = hashPassword;
exports.generateSecurePassword = generateSecurePassword;
const crypto = require("crypto");
function generateSecurePassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}
function generateAdminCredentials() {
    const email = 'admin@memento-mori.com';
    const password = generateSecurePassword(16);
    console.log('\n========================================');
    console.log('🔐 УЧЁТНЫЕ ДАННЫЕ АДМИНИСТРАТОРА');
    console.log('========================================\n');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Пароль: ${password}`);
    console.log('\n⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!');
    console.log('========================================\n');
    return {
        email,
        password,
        passwordHash: hashPassword(password),
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
    };
}
async function main() {
    try {
        const credentials = generateAdminCredentials();
        const fs = require('fs');
        const path = require('path');
        const credentialsPath = path.join(__dirname, '../../ADMIN_CREDENTIALS.json');
        const credentialsToSave = {
            email: credentials.email,
            password: credentials.password,
            role: credentials.role,
            createdAt: credentials.createdAt,
            note: '⚠️ Этот файл содержит пароль в открытом виде. Используйте только для разработки!',
        };
        fs.writeFileSync(credentialsPath, JSON.stringify(credentialsToSave, null, 2));
        console.log(`💾 Данные сохранены в: ${credentialsPath}`);
        console.log('⚠️  Удалите этот файл после использования в продакшене!\n');
    }
    catch (error) {
        console.error('❌ Ошибка при создании администратора:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=create-admin.js.map