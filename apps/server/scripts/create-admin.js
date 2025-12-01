/**
 * Скрипт для генерации учётных данных администратора
 * 
 * Использование:
 *   node scripts/create-admin.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Генерация безопасного пароля
function generateSecurePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  // Гарантируем наличие всех типов символов
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Заполняем остаток случайными символами
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Перемешиваем символы
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Генерация учётных данных
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
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  };
}

// Основная функция
function main() {
  try {
    const credentials = generateAdminCredentials();

    // Сохраняем данные в файл
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

    // Также обновляем ADMIN_CREDENTIALS.md
    const mdPath = path.join(__dirname, '../../../ADMIN_CREDENTIALS.md');
    const mdContent = `# Учётные данные администратора

## Учётные данные по умолчанию

**Email/Логин:** \`${credentials.email}\`  
**Пароль:** \`${credentials.password}\`

---

## Важно

⚠️ **Эти учётные данные предназначены только для разработки и тестирования!**

После первого входа в систему **обязательно измените пароль** на более надёжный.

---

## Рекомендации по безопасности

1. Используйте сложный пароль (минимум 12 символов, включая заглавные и строчные буквы, цифры и специальные символы)
2. Не используйте эти учётные данные в продакшене
3. Настройте переменные окружения для хранения учётных данных в продакшене
4. Регулярно меняйте пароли администраторов

---

## Информация об аккаунте

- **Роль:** ${credentials.role}
- **Создан:** ${new Date(credentials.createdAt).toLocaleString('ru-RU')}
- **Email:** ${credentials.email}

---

## Настройка через переменные окружения

Для продакшена рекомендуется использовать переменные окружения:

\`\`\`env
ADMIN_EMAIL=${credentials.email}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
ADMIN_INITIAL_PASSWORD_CHANGE_REQUIRED=true
\`\`\`

---

**Сгенерировано:** ${new Date().toISOString()}
`;

    fs.writeFileSync(mdPath, mdContent);
    console.log(`📝 Файл ADMIN_CREDENTIALS.md обновлён\n`);

  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    process.exit(1);
  }
}

// Запуск скрипта
main();

