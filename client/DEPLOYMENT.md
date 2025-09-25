# Развертывание PWA Object Journal

## Предварительные требования

1. **HTTPS** - PWA требует безопасное соединение
2. **Иконки** - Все необходимые иконки в папке `public/icons/`
3. **Service Worker** - Уже настроен в `public/sw.js`

## Шаги развертывания

### 1. Генерация иконок

```bash
# Если у вас есть исходная иконка 512x512
node scripts/generate-icons.js path/to/your-icon-512x512.png

# Или создайте иконки вручную в размерах:
# 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
```

### 2. Сборка проекта

```bash
npm run build
```

### 3. Тестирование локально

```bash
# Установите serve глобально
npm install -g serve

# Запустите локальный HTTPS сервер
serve -s dist --ssl-cert path/to/cert.pem --ssl-key path/to/key.pem

# Или используйте http-server с HTTPS
npx http-server dist -S -C path/to/cert.pem -K path/to/key.pem
```

### 4. Проверка PWA

1. Откройте приложение в Chrome
2. Откройте DevTools (F12)
3. Перейдите в Application > Manifest
4. Проверьте, что все поля заполнены корректно
5. Перейдите в Application > Service Workers
6. Убедитесь, что Service Worker зарегистрирован

### 5. Установка приложения

1. В Chrome нажмите на иконку "Установить" в адресной строке
2. Или используйте меню браузера > "Установить Object Journal"
3. На мобильных устройствах появится предложение "Добавить на главный экран"

## Настройка веб-сервера

### Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /path/to/dist;
    index index.html;

    # Кэширование для PWA
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker должен обновляться
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Манифест
    location /manifest.json {
        add_header Content-Type application/json;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /path/to/dist

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    # Кэширование
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>

    # Service Worker
    <Location "/sw.js">
        ExpiresActive Off
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </Location>

    # SPA fallback
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

## Проверка после развертывания

### Lighthouse Audit

1. Откройте приложение в Chrome
2. Откройте DevTools (F12)
3. Перейдите в Lighthouse
4. Выберите "Progressive Web App"
5. Запустите аудит
6. Убедитесь, что все проверки пройдены

### Мобильное тестирование

1. Откройте приложение на мобильном устройстве
2. Проверьте установку через "Добавить на главный экран"
3. Протестируйте работу камеры
4. Проверьте офлайн режим

## Возможные проблемы

### 1. Service Worker не регистрируется

- Проверьте, что приложение работает по HTTPS
- Убедитесь, что файл `sw.js` доступен по пути `/sw.js`

### 2. Иконки не отображаются

- Проверьте пути к иконкам в манифесте
- Убедитесь, что все файлы иконок существуют
- Проверьте MIME-типы файлов

### 3. Камера не работает

- Проверьте разрешения в браузере
- Убедитесь, что используется HTTPS
- Проверьте поддержку getUserMedia в браузере

### 4. Приложение не устанавливается

- Проверьте манифест на валидность
- Убедитесь, что все обязательные поля заполнены
- Проверьте размеры иконок

## Мониторинг

### Аналитика PWA

```javascript
// Добавьте в App.tsx для отслеживания установки PWA
useEffect(() => {
  const handleBeforeInstallPrompt = e => {
    console.log('PWA может быть установлено');
    // Сохраните событие для показа кнопки установки
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  return () => {
    window.removeEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );
  };
}, []);
```

### Отслеживание использования

- Google Analytics для PWA
- Firebase Analytics
- Собственная аналитика через Service Worker

## Обновления

При обновлении приложения:

1. Обновите версию в `manifest.json`
2. Обновите `CACHE_NAME` в `sw.js`
3. Пересоберите проект
4. Разверните обновления
5. Service Worker автоматически обновит кэш
