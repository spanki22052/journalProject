const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Размеры иконок для PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG контент
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Фон -->
  <rect width="512" height="512" rx="80" fill="#1890ff"/>
  
  <!-- Документ/журнал -->
  <rect x="100" y="80" width="280" height="360" rx="20" fill="white" stroke="#e6f7ff" stroke-width="4"/>
  
  <!-- Строки текста в журнале -->
  <rect x="130" y="120" width="200" height="8" rx="4" fill="#1890ff" opacity="0.7"/>
  <rect x="130" y="140" width="180" height="8" rx="4" fill="#1890ff" opacity="0.5"/>
  <rect x="130" y="160" width="220" height="8" rx="4" fill="#1890ff" opacity="0.7"/>
  <rect x="130" y="180" width="160" height="8" rx="4" fill="#1890ff" opacity="0.5"/>
  <rect x="130" y="200" width="190" height="8" rx="4" fill="#1890ff" opacity="0.7"/>
  
  <!-- Камера/фото иконка -->
  <circle cx="320" cy="200" r="40" fill="#52c41a" stroke="white" stroke-width="6"/>
  <circle cx="320" cy="200" r="25" fill="white"/>
  <circle cx="320" cy="200" r="15" fill="#52c41a"/>
  
  <!-- Календарь -->
  <rect x="130" y="250" width="180" height="120" rx="8" fill="#f0f0f0" stroke="#d9d9d9" stroke-width="2"/>
  <rect x="130" y="250" width="180" height="30" rx="8" fill="#1890ff"/>
  <rect x="140" y="260" width="160" height="10" rx="2" fill="white"/>
  
  <!-- Сетка календаря -->
  <line x1="150" y1="290" x2="290" y2="290" stroke="#d9d9d9" stroke-width="1"/>
  <line x1="150" y1="310" x2="290" y2="310" stroke="#d9d9d9" stroke-width="1"/>
  <line x1="150" y1="330" x2="290" y2="330" stroke="#d9d9d9" stroke-width="1"/>
  <line x1="150" y1="350" x2="290" y2="350" stroke="#d9d9d9" stroke-width="1"/>
  
  <line x1="180" y1="290" x2="180" y2="360" stroke="#d9d9d9" stroke-width="1"/>
  <line x1="210" y1="290" x2="210" y2="360" stroke="#d9d9d9" stroke-width="1"/>
  <line x1="240" y1="290" x2="240" y2="360" stroke="#d9d9d9" stroke-width="1"/>
  <line x1="270" y1="290" x2="270" y2="360" stroke="#d9d9d9" stroke-width="1"/>
  
  <!-- Точки в календаре (события) -->
  <circle cx="165" cy="300" r="3" fill="#52c41a"/>
  <circle cx="195" cy="320" r="3" fill="#faad14"/>
  <circle cx="225" cy="340" r="3" fill="#f5222d"/>
  
  <!-- Заголовок "OJ" -->
  <text x="256" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">OJ</text>
</svg>`;

// Создаем директорию для иконок если её нет
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Конвертируем SVG в PNG для каждого размера
async function convertIcons() {
  console.log('Конвертация SVG в PNG...');

  for (const size of iconSizes) {
    try {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Создан icon-${size}x${size}.png`);
    } catch (error) {
      console.error(
        `✗ Ошибка при создании icon-${size}x${size}.png:`,
        error.message
      );
    }
  }

  console.log('\\nВсе PNG иконки созданы!');
}

convertIcons().catch(console.error);
