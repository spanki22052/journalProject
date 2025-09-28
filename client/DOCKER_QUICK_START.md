# Docker для Vite PWA - Быстрый старт

## 🚀 Быстрая сборка и запуск

### 1. Сборка образа

```bash
# Простая сборка
docker build -t object-journal:latest .

# Сборка с версией
docker build -t object-journal:v1.0.0 .
```

### 2. Запуск контейнера

```bash
# Запуск в фоне
docker run -d -p 8080:8080 object-journal:latest

# Запуск с именем
docker run -d -p 8080:8080 --name object-journal-app object-journal:latest
```

### 3. Проверка работы

```bash
# Проверка статуса
docker ps

# Проверка приложения
curl http://localhost:8080/

# Проверка PWA
curl http://localhost:8080/manifest.webmanifest
curl http://localhost:8080/sw.js
```

## 📦 Docker Compose

### Запуск с docker-compose

```bash
# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## 🔧 Полезные команды

### Управление контейнерами

```bash
# Список контейнеров
docker ps -a

# Остановка контейнера
docker stop <container_id>

# Удаление контейнера
docker rm <container_id>

# Удаление образа
docker rmi object-journal:latest
```

### Отладка

```bash
# Логи контейнера
docker logs <container_id>

# Вход в контейнер
docker exec -it <container_id> sh

# Проверка файлов
docker exec -it <container_id> ls -la /usr/share/nginx/html/
```

## 🌐 Доступ к приложению

После запуска приложение будет доступно по адресу:

- **HTTP**: http://localhost:8080
- **PWA манифест**: http://localhost:8080/manifest.webmanifest
- **Service Worker**: http://localhost:8080/sw.js

## ⚡ Особенности Vite PWA

- **Быстрая сборка** - Vite обеспечивает быструю разработку
- **PWA готовность** - автоматическая генерация манифеста и SW
- **Офлайн работа** - кэширование ресурсов
- **Оптимизация** - автоматическое разделение кода

## 🐛 Troubleshooting

### Проблемы со сборкой

```bash
# Очистка Docker кэша
docker system prune -a

# Пересборка без кэша
docker build --no-cache -t object-journal:latest .
```

### Проблемы с запуском

```bash
# Проверка логов
docker logs <container_id>

# Проверка портов
netstat -tulpn | grep 8080
```

### Проблемы с PWA

1. Откройте DevTools в браузере
2. Перейдите в Application > Service Workers
3. Проверьте статус регистрации SW
4. Проверьте манифест в Application > Manifest

## 📊 Мониторинг

### Использование ресурсов

```bash
# Статистика контейнера
docker stats <container_id>

# Информация о контейнере
docker inspect <container_id>
```

### Healthcheck

Контейнер автоматически проверяет:

- Доступность главной страницы
- Доступность PWA манифеста
- Доступность Service Worker

## 🔒 Безопасность

- Запуск от непривилегированного пользователя
- Заголовки безопасности
- CORS настройки
- PWA разрешения

## 📱 PWA функции

- Установка как приложение
- Офлайн работа
- Push уведомления
- Доступ к камере и геолокации
- Фоновое обновление
