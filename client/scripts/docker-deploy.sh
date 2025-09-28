#!/bin/bash

# Скрипт для развертывания Object Journal в Docker

set -e

echo "🚀 Развертывание Object Journal..."

# Проверяем, что docker-compose доступен
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Ошибка: docker-compose не установлен"
    exit 1
fi

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ошибка: docker-compose.yml не найден. Запустите скрипт из корневой директории проекта."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down || true

# Собираем и запускаем новые контейнеры
echo "🔨 Сборка и запуск контейнеров..."
docker-compose up --build -d

# Ждем запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус контейнеров:"
docker-compose ps

# Проверяем здоровье
echo "🏥 Проверка здоровья приложения..."
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Приложение успешно запущено!"
    echo "🌐 Доступно по адресу: http://localhost:8080"
else
    echo "❌ Ошибка: Приложение не отвечает"
    echo "📋 Логи контейнера:"
    docker-compose logs object-journal
    exit 1
fi

echo ""
echo "🎉 Развертывание завершено успешно!"
echo ""
echo "📝 Полезные команды:"
echo "   Просмотр логов: docker-compose logs -f"
echo "   Остановка:      docker-compose down"
echo "   Перезапуск:     docker-compose restart"
echo "   Обновление:     docker-compose pull && docker-compose up -d"
