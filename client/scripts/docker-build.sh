#!/bin/bash

# Скрипт для сборки Docker образа Object Journal

set -e

echo "🐳 Сборка Docker образа Object Journal..."

# Проверяем, что мы в правильной директории
if [ ! -f "Dockerfile" ]; then
    echo "❌ Ошибка: Dockerfile не найден. Запустите скрипт из корневой директории проекта."
    exit 1
fi

# Получаем версию из package.json
VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="object-journal"
TAG="${IMAGE_NAME}:${VERSION}"
LATEST_TAG="${IMAGE_NAME}:latest"

echo "📦 Версия: ${VERSION}"
echo "🏷️  Тег образа: ${TAG}"

# Собираем образ
echo "🔨 Сборка образа..."
docker build -t ${TAG} -t ${LATEST_TAG} .

echo "✅ Образ успешно собран!"
echo "📋 Доступные теги:"
echo "   - ${TAG}"
echo "   - ${LATEST_TAG}"

# Показываем размер образа
echo "📊 Размер образа:"
docker images ${IMAGE_NAME} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo "🚀 Для запуска используйте:"
echo "   docker run -p 8080:8080 ${LATEST_TAG}"
echo ""
echo "📝 Или с docker-compose:"
echo "   docker-compose up -d"
