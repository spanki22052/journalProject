#!/usr/bin/env node

/**
 * Скрипт для генерации иконок PWA
 * Требует наличия исходной иконки 512x512 в формате PNG
 *
 * Использование:
 * node scripts/generate-icons.js path/to/source-icon.png
 */

const fs = require('fs');
const path = require('path');

// Размеры иконок для PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIconInstructions(sourceIconPath) {
  const instructions = `
# Инструкции по генерации иконок PWA

## Исходный файл: ${sourceIconPath}

Для создания всех необходимых иконок PWA выполните следующие команды:

${iconSizes
  .map(
    size =>
      `# Иконка ${size}x${size}
convert "${sourceIconPath}" -resize ${size}x${size} public/icons/icon-${size}x${size}.png`
  )
  .join('\n')}

## Альтернативно, используйте онлайн-генераторы:

1. **PWA Builder** - https://www.pwabuilder.com/imageGenerator
2. **Favicon Generator** - https://realfavicongenerator.net/
3. **PWA Icon Generator** - https://tools.crawlink.com/tools/pwa-icon-generator/

## Требования к иконкам:

- Формат: PNG
- Прозрачность: Поддерживается
- Стиль: Простой, узнаваемый
- Цвета: Соответствуют бренду приложения
- Качество: Высокое разрешение для четкости на всех устройствах

## Проверка иконок:

После генерации проверьте, что все файлы созданы в папке public/icons/:
${iconSizes.map(size => `- icon-${size}x${size}.png`).join('\n')}
`;

  console.log(instructions);

  // Создаем папку icons если её нет
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('Создана папка public/icons/');
  }
}

// Получаем путь к исходной иконке из аргументов командной строки
const sourceIconPath = process.argv[2];

if (!sourceIconPath) {
  console.log(
    'Использование: node scripts/generate-icons.js path/to/source-icon.png'
  );
  console.log('Пример: node scripts/generate-icons.js assets/logo-512x512.png');
  process.exit(1);
}

if (!fs.existsSync(sourceIconPath)) {
  console.error(`Ошибка: Файл ${sourceIconPath} не найден`);
  process.exit(1);
}

generateIconInstructions(sourceIconPath);
