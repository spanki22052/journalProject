# Руководство по развертыванию Object Journal

## Подготовка к production

### 1. Сборка проекта

```bash
npm run build
```

### 2. Проверка сборки

После сборки в папке `dist/` должны быть:

- `index.html` - главная страница
- `bundle.*.js` - JavaScript файлы
- `service-worker.js` - Service Worker для PWA
- `workbox-*.js` - Workbox библиотека
- Исходные карты (source maps)

## Настройка сервера

### Apache (.htaccess)

Используйте файл `.htaccess` из папки `public/`:

- Включено сжатие gzip
- Настроено кэширование статических ресурсов
- Добавлены заголовки безопасности
- Настроена поддержка PWA

### Nginx

Используйте конфигурацию из файла `nginx.conf`:

- Настроено сжатие gzip
- Кэширование статических файлов
- Заголовки безопасности
- Поддержка SPA роутинга

## Переменные окружения

Обновите следующие URL в файлах:

- `public/index.html` - замените `https://your-domain.com/` на ваш домен
- `public/robots.txt` - обновите Sitemap URL
- `public/sitemap.xml` - обновите все URL на ваш домен

## PWA настройки

### Service Worker

- Автоматически генерируется workbox
- Кэширует статические ресурсы
- Поддерживает офлайн режим

### Манифест

- `public/manifest.json` содержит настройки PWA
- Иконки находятся в `public/icons/`
- Поддерживает установку на устройство

## SEO оптимизация

### Robots.txt

- `public/robots.txt` настроен для поисковых роботов
- Разрешает индексацию всех страниц
- Исключает служебные директории

### Sitemap

- `public/sitemap.xml` содержит карту сайта
- Обновите URL на ваш домен

### Мета-теги

- Open Graph теги для социальных сетей
- Twitter Card теги
- Стандартные SEO мета-теги

## Мониторинг

### Web Vitals

Приложение включает библиотеку `web-vitals` для мониторинга производительности.

### Логирование

Service Worker логирует события в консоль браузера.

## Безопасность

### CSP (Content Security Policy)

Рекомендуется добавить CSP заголовки:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;
```

### HTTPS

Обязательно используйте HTTPS для PWA функциональности.

## Проверка после деплоя

1. Откройте сайт в браузере
2. Проверьте работу Service Worker в DevTools > Application
3. Протестируйте установку PWA
4. Проверьте офлайн режим
5. Убедитесь в корректной работе всех страниц

## Troubleshooting

### Service Worker не регистрируется

- Проверьте, что сайт работает по HTTPS
- Убедитесь, что файл `service-worker.js` доступен

### PWA не устанавливается

- Проверьте манифест в DevTools > Application > Manifest
- Убедитесь, что все иконки загружаются

### Проблемы с роутингом

- Проверьте настройки сервера для SPA
- Убедитесь, что все маршруты ведут на `index.html`
