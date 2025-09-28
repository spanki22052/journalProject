# Многоэтапная сборка для Object Journal PWA

# Этап 1: Сборка приложения
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci --silent

# Копируем исходный код
COPY . .

# Собираем приложение для production
RUN npm run build

# Этап 2: Production сервер с nginx
FROM nginx:alpine AS production

# Устанавливаем дополнительные пакеты
RUN apk add --no-cache \
    curl \
    tzdata

# Устанавливаем временную зону
ENV TZ=Europe/Moscow

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию для Docker
COPY public/nginx-docker.conf /etc/nginx/conf.d/default.conf

# Копируем robots.txt и sitemap.xml
COPY public/robots.txt /usr/share/nginx/html/
COPY public/sitemap.xml /usr/share/nginx/html/

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nginx 2>/dev/null || true && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true

# Устанавливаем права доступа
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Создаем директории для логов
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/log/nginx

# Не переключаемся на пользователя nginx - запускаем nginx от root
# но nginx будет использовать непривилегированного пользователя для worker процессов

# Открываем порт 8080
EXPOSE 8080

# Проверка здоровья контейнера
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
