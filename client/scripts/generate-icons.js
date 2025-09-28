const fs = require('fs');
const path = require('path');

// Размеры иконок для PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG шаблон для генерации иконок
const generateIconSVG = size => {
  const scale = size / 512;
  const strokeWidth = Math.max(2, 4 * scale);
  const fontSize = Math.max(16, 32 * scale);

  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Фон -->
  <rect width="512" height="512" rx="${80 * scale}" fill="#1890ff"/>
  
  <!-- Документ/журнал -->
  <rect x="${100 * scale}" y="${80 * scale}" width="${280 * scale}" height="${360 * scale}" rx="${20 * scale}" fill="white" stroke="#e6f7ff" stroke-width="${strokeWidth}"/>
  
  <!-- Строки текста в журнале -->
  <rect x="${130 * scale}" y="${120 * scale}" width="${200 * scale}" height="${8 * scale}" rx="${4 * scale}" fill="#1890ff" opacity="0.7"/>
  <rect x="${130 * scale}" y="${140 * scale}" width="${180 * scale}" height="${8 * scale}" rx="${4 * scale}" fill="#1890ff" opacity="0.5"/>
  <rect x="${130 * scale}" y="${160 * scale}" width="${220 * scale}" height="${8 * scale}" rx="${4 * scale}" fill="#1890ff" opacity="0.7"/>
  <rect x="${130 * scale}" y="${180 * scale}" width="${160 * scale}" height="${8 * scale}" rx="${4 * scale}" fill="#1890ff" opacity="0.5"/>
  <rect x="${130 * scale}" y="${200 * scale}" width="${190 * scale}" height="${8 * scale}" rx="${4 * scale}" fill="#1890ff" opacity="0.7"/>
  
  <!-- Камера/фото иконка -->
  <circle cx="${320 * scale}" cy="${200 * scale}" r="${40 * scale}" fill="#52c41a" stroke="white" stroke-width="${6 * scale}"/>
  <circle cx="${320 * scale}" cy="${200 * scale}" r="${25 * scale}" fill="white"/>
  <circle cx="${320 * scale}" cy="${200 * scale}" r="${15 * scale}" fill="#52c41a"/>
  
  <!-- Календарь -->
  <rect x="${130 * scale}" y="${250 * scale}" width="${180 * scale}" height="${120 * scale}" rx="${8 * scale}" fill="#f0f0f0" stroke="#d9d9d9" stroke-width="${2 * scale}"/>
  <rect x="${130 * scale}" y="${250 * scale}" width="${180 * scale}" height="${30 * scale}" rx="${8 * scale}" fill="#1890ff"/>
  <rect x="${140 * scale}" y="${260 * scale}" width="${160 * scale}" height="${10 * scale}" rx="${2 * scale}" fill="white"/>
  
  <!-- Сетка календаря -->
  <line x1="${150 * scale}" y1="${290 * scale}" x2="${290 * scale}" y2="${290 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  <line x1="${150 * scale}" y1="${310 * scale}" x2="${290 * scale}" y2="${310 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  <line x1="${150 * scale}" y1="${330 * scale}" x2="${290 * scale}" y2="${330 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  <line x1="${150 * scale}" y1="${350 * scale}" x2="${290 * scale}" y2="${350 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  
  <line x1="${180 * scale}" y1="${290 * scale}" x2="${180 * scale}" y2="${360 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  <line x1="${210 * scale}" y1="${290 * scale}" x2="${210 * scale}" y2="${360 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  <line x1="${240 * scale}" y1="${290 * scale}" x2="${240 * scale}" y2="${360 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  <line x1="${270 * scale}" y1="${290 * scale}" x2="${270 * scale}" y2="${360 * scale}" stroke="#d9d9d9" stroke-width="${1 * scale}"/>
  
  <!-- Точки в календаре (события) -->
  <circle cx="${165 * scale}" cy="${300 * scale}" r="${3 * scale}" fill="#52c41a"/>
  <circle cx="${195 * scale}" cy="${320 * scale}" r="${3 * scale}" fill="#faad14"/>
  <circle cx="${225 * scale}" cy="${340 * scale}" r="${3 * scale}" fill="#f5222d"/>
  
  <!-- Заголовок "OJ" -->
  <text x="${256 * scale}" y="${50 * scale}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">OJ</text>
</svg>`;
};

// Создаем директорию для иконок если её нет
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Генерируем SVG файлы для каждого размера
iconSizes.forEach(size => {
  const svgContent = generateIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Создаем также PNG версии (потребуется дополнительная библиотека для конвертации)
// Пока что создадим простые HTML файлы для конвертации в браузере
const htmlConverter = `
<!DOCTYPE html>
<html>
<head>
  <title>Icon Converter</title>
</head>
<body>
  <h1>Object Journal Icons</h1>
  <p>Откройте этот файл в браузере и сохраните каждую иконку как PNG:</p>
  ${iconSizes
    .map(
      size => `
    <div style="margin: 20px; display: inline-block;">
      <h3>${size}x${size}</h3>
      <div id="icon-${size}"></div>
      <br>
      <button onclick="downloadIcon(${size})">Скачать PNG</button>
    </div>
  `
    )
    .join('')}

  <script>
    const iconSizes = [${iconSizes.join(', ')}];
    
    iconSizes.forEach(size => {
      const svg = \`${generateIconSVG(512).replace(/`/g, '\\`')}\`;
      const div = document.getElementById(\`icon-\${size}\`);
      div.innerHTML = svg;
      
      // Масштабируем SVG до нужного размера
      const svgElement = div.querySelector('svg');
      svgElement.setAttribute('width', size);
      svgElement.setAttribute('height', size);
    });
    
    function downloadIcon(size) {
      const svg = document.getElementById(\`icon-\${size}\`).querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = size;
      canvas.height = size;
      
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = \`icon-\${size}x\${size}.png\`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(iconsDir, 'converter.html'), htmlConverter);
console.log('Created converter.html for PNG generation');

console.log('\\nИконки сгенерированы!');
console.log('Для создания PNG версий:');
console.log('1. Откройте public/icons/converter.html в браузере');
console.log('2. Нажмите кнопки "Скачать PNG" для каждого размера');
console.log('3. Сохраните файлы в папку public/icons/');
