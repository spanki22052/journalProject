# Docker для Vite PWA

## Обзор

Этот проект использует Docker для контейнеризации Vite PWA приложения с многоэтапной сборкой для оптимизации размера образа.

## Структура

- `Dockerfile` - многоэтапная сборка с Vite
- `docker-compose.yml` - оркестрация контейнеров
- `public/nginx-docker.conf` - конфигурация nginx для PWA
- `scripts/docker-build-vite.sh` - скрипт сборки

## Особенности

### Многоэтапная сборка

1. **Builder этап** - сборка приложения с Vite
2. **Production этап** - nginx сервер с оптимизированным образом

### PWA поддержка

- Service Worker (`/sw.js`)
- PWA манифест (`/manifest.webmanifest`)
- Автоматическое кэширование
- Офлайн работа

### Оптимизация

- Минимальный размер образа
- Кэширование слоев Docker
- Gzip сжатие
- Оптимизированные заголовки

## Быстрый старт

### 1. Сборка образа

```bash
# Используя скрипт (рекомендуется)
./scripts/docker-build-vite.sh

# Или вручную
docker build -t object-journal:latest .
```

### 2. Запуск контейнера

```bash
# Простой запуск
docker run -d -p 8080:8080 object-journal:latest

# С docker-compose
docker-compose up -d
```

### 3. Проверка

```bash
# Проверка статуса
docker ps

# Проверка логов
docker logs <container_id>

# Проверка приложения
curl http://localhost:8080/
```

## Команды

### Сборка

```bash
# Сборка с тегом
./scripts/docker-build-vite.sh v1.0.0 1.0.0

# Сборка только образа
docker build -t object-journal:latest .
```

### Запуск

```bash
# Запуск в фоне
docker run -d -p 8080:8080 object-journal:latest

# Запуск с переменными окружения
docker run -d -p 8080:8080 \
  -e NODE_ENV=production \
  -e TZ=Europe/Moscow \
  object-journal:latest

# Запуск с docker-compose
docker-compose up -d
```

### Управление

```bash
# Остановка
docker stop <container_id>

# Удаление контейнера
docker rm <container_id>

# Удаление образа
docker rmi object-journal:latest

# Просмотр логов
docker logs -f <container_id>

# Вход в контейнер
docker exec -it <container_id> sh
```

## Конфигурация

### Переменные окружения

- `NODE_ENV=production` - режим сборки
- `TZ=Europe/Moscow` - временная зона
- `VITE_APP_VERSION` - версия приложения

### Порты

- `8080` - основной порт приложения

### Healthcheck

Проверяет доступность:

- Главной страницы (`/`)
- PWA манифеста (`/manifest.webmanifest`)
- Service Worker (`/sw.js`)

## Nginx конфигурация

### Кэширование

- Статические ресурсы: 1 год
- PWA манифест: 1 неделя
- Service Worker: без кэширования

### Сжатие

- Gzip для текстовых файлов
- Оптимизированные заголовки

### Безопасность

- Заголовки безопасности
- PWA разрешения
- CORS настройки

## Мониторинг

### Логи

```bash
# Все логи
docker logs <container_id>

# Последние 100 строк
docker logs --tail 100 <container_id>

# Логи в реальном времени
docker logs -f <container_id>
```

### Метрики

```bash
# Использование ресурсов
docker stats <container_id>

# Информация о контейнере
docker inspect <container_id>
```

## Troubleshooting

### Проблемы со сборкой

1. Проверьте, что Vite установлен: `npm list vite`
2. Проверьте локальную сборку: `npm run build`
3. Очистите Docker кэш: `docker system prune -a`

### Проблемы с запуском

1. Проверьте логи: `docker logs <container_id>`
2. Проверьте порты: `netstat -tulpn | grep 8080`
3. Проверьте healthcheck: `docker inspect <container_id>`

### Проблемы с PWA

1. Проверьте манифест: `curl http://localhost:8080/manifest.webmanifest`
2. Проверьте SW: `curl http://localhost:8080/sw.js`
3. Проверьте в DevTools браузера

## Production

### Рекомендации

1. Используйте HTTPS в production
2. Настройте мониторинг
3. Используйте reverse proxy (Traefik, Nginx)
4. Настройте логирование

### Масштабирование

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  object-journal:
    image: object-journal:latest
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## Разработка

### Hot reload

Для разработки используйте Vite dev сервер:

```bash
npm run dev
```

### Отладка

```bash
# Запуск с отладкой
docker run -it --rm -p 8080:8080 object-journal:latest sh

# Проверка файлов
docker exec -it <container_id> ls -la /usr/share/nginx/html/
```
