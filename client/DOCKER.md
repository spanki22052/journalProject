# Docker развертывание Object Journal

## Быстрый старт

### 1. Сборка и запуск

```bash
# Сборка образа
./scripts/docker-build.sh

# Запуск контейнера
docker-compose up -d
```

### 2. Проверка работы

```bash
# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Проверка здоровья
curl http://localhost:8080/
```

## Ручная сборка

### Сборка Docker образа

```bash
# Сборка с тегом версии
docker build -t object-journal:latest .

# Сборка с конкретной версией
docker build -t object-journal:1.0.0 .
```

### Запуск контейнера

```bash
# Базовый запуск
docker run -p 8080:8080 object-journal:latest

# Запуск в фоне
docker run -d -p 8080:8080 --name object-journal-app object-journal:latest

# Запуск с переменными окружения
docker run -d -p 8080:8080 \
  -e NODE_ENV=production \
  -e TZ=Europe/Moscow \
  --name object-journal-app \
  object-journal:latest
```

## Docker Compose

### Разработка

```bash
# Запуск для разработки
docker-compose up -d

# Просмотр логов
docker-compose logs -f object-journal

# Остановка
docker-compose down
```

### Production

```bash
# Запуск production версии
docker-compose -f docker-compose.prod.yml up -d

# С пересборкой
docker-compose -f docker-compose.prod.yml up --build -d
```

## Управление контейнерами

### Полезные команды

```bash
# Просмотр всех контейнеров
docker ps -a

# Просмотр логов
docker logs object-journal-app

# Вход в контейнер
docker exec -it object-journal-app sh

# Остановка контейнера
docker stop object-journal-app

# Удаление контейнера
docker rm object-journal-app

# Удаление образа
docker rmi object-journal:latest
```

### Мониторинг

```bash
# Использование ресурсов
docker stats object-journal-app

# Проверка здоровья
docker inspect object-journal-app | grep Health -A 10

# Просмотр процессов в контейнере
docker top object-journal-app
```

## Настройка для production

### 1. Обновите домен

В файлах `docker-compose.yml` и `docker-compose.prod.yml` замените `your-domain.com` на ваш домен.

### 2. SSL сертификаты

Для HTTPS добавьте SSL сертификаты в папку `ssl/` и обновите nginx конфигурацию.

### 3. Переменные окружения

Создайте файл `.env` с необходимыми переменными:

```env
NODE_ENV=production
TZ=Europe/Moscow
DOMAIN=your-domain.com
```

### 4. Reverse Proxy

Для production рекомендуется использовать nginx или traefik как reverse proxy.

## Troubleshooting

### Проблемы с портами

```bash
# Проверка занятых портов
netstat -tulpn | grep :8080

# Изменение порта
docker run -p 3001:8080 object-journal:latest
```

### Проблемы с памятью

```bash
# Ограничение памяти
docker run -m 512m -p 8080:8080 object-journal:latest

# Проверка использования памяти
docker stats object-journal-app
```

### Проблемы с сетью

```bash
# Проверка сетевых подключений
docker network ls
docker network inspect object-journal-network

# Создание пользовательской сети
docker network create object-journal-network
```

### Логи и отладка

```bash
# Подробные логи
docker-compose logs --tail=100 -f

# Логи nginx
docker exec object-journal-app cat /var/log/nginx/error.log

# Проверка конфигурации nginx
docker exec object-journal-app nginx -t
```

## Безопасность

### 1. Пользователь без root

Контейнер запускается от пользователя nginx (UID 1001) для безопасности.

### 2. Минимальный образ

Используется Alpine Linux для уменьшения размера образа и поверхности атаки.

### 3. Заголовки безопасности

Nginx настроен с заголовками безопасности для защиты от XSS, clickjacking и других атак.

### 4. Ограничения ресурсов

```bash
# Ограничение CPU и памяти
docker run --cpus="1.0" --memory="512m" -p 8080:8080 object-journal:latest
```

## Мониторинг и логирование

### 1. Логи

```bash
# Настройка ротации логов
docker run --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p 8080:8080 object-journal:latest
```

### 2. Health checks

Контейнер включает health check, который проверяет доступность приложения каждые 30 секунд.

### 3. Метрики

Для мониторинга можно использовать Prometheus + Grafana или другие системы мониторинга.
