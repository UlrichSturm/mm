/**
 * Скрипт для создания администратора в базе данных через Prisma
 * 
 * Использование:
 *   node scripts/create-admin-prisma.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@memento-mori.com';
    const password = 'zPim^&LND5!TcOm@'; // Пароль из ADMIN_CREDENTIALS.md

    // Проверяем, существует ли уже администратор
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('✅ Администратор уже существует в базе данных');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`🆔 ID: ${existingAdmin.id}`);
      return;
    }

    // Создаем администратора
    const admin = await prisma.user.create({
      data: {
        email,
        password, // В продакшене нужно хешировать
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    console.log('\n========================================');
    console.log('✅ АДМИНИСТРАТОР УСПЕШНО СОЗДАН');
    console.log('========================================\n');
    console.log(`🆔 ID: ${admin.id}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Роль: ${admin.role}`);
    console.log(`📅 Создан: ${admin.createdAt.toLocaleString()}`);
    console.log('\n========================================\n');
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
createAdmin()
  .then(() => {
    console.log('✅ Скрипт выполнен успешно');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка выполнения скрипта:', error);
    process.exit(1);
  });

