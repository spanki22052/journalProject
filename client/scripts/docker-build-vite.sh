#!/bin/bash

# Скрипт для сборки Docker образа с Vite PWA

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    error "package.json не найден. Запустите скрипт из корневой директории проекта."
    exit 1
fi

# Проверяем, что Vite установлен
if ! npm list vite > /dev/null 2>&1; then
    error "Vite не установлен. Запустите: npm install"
    exit 1
fi

# Параметры
IMAGE_NAME="object-journal"
TAG=${1:-latest}
VERSION=${2:-1.0.0}

log "Начинаем сборку Docker образа для Vite PWA..."
log "Образ: ${IMAGE_NAME}:${TAG}"
log "Версия: ${VERSION}"

# Очищаем предыдущие сборки
log "Очищаем предыдущие сборки..."
docker system prune -f > /dev/null 2>&1 || true

# Собираем приложение локально для проверки
log "Собираем приложение локально..."
export VITE_APP_VERSION=${VERSION}
npm run build

if [ $? -ne 0 ]; then
    error "Сборка приложения не удалась"
    exit 1
fi

success "Локальная сборка успешна"

# Проверяем, что dist папка создана
if [ ! -d "dist" ]; then
    error "Папка dist не найдена после сборки"
    exit 1
fi

# Проверяем PWA файлы
log "Проверяем PWA файлы..."
if [ ! -f "dist/manifest.webmanifest" ]; then
    warning "manifest.webmanifest не найден"
fi

if [ ! -f "dist/sw.js" ]; then
    warning "sw.js не найден"
fi

if [ ! -f "dist/registerSW.js" ]; then
    warning "registerSW.js не найден"
fi

# Собираем Docker образ
log "Собираем Docker образ..."
docker build \
    --build-arg NODE_ENV=production \
    --build-arg VITE_APP_VERSION=${VERSION} \
    --tag ${IMAGE_NAME}:${TAG} \
    --tag ${IMAGE_NAME}:latest \
    .

if [ $? -ne 0 ]; then
    error "Сборка Docker образа не удалась"
    exit 1
fi

success "Docker образ собран успешно"

# Показываем информацию об образе
log "Информация об образе:"
docker images ${IMAGE_NAME}:${TAG}

# Показываем размер образа
SIZE=$(docker images --format "table {{.Size}}" ${IMAGE_NAME}:${TAG} | tail -n 1)
log "Размер образа: ${SIZE}"

# Тестируем образ
log "Тестируем образ..."
CONTAINER_ID=$(docker run -d -p 8080:8080 ${IMAGE_NAME}:${TAG})

# Ждем запуска контейнера
sleep 5

# Проверяем, что контейнер запущен
if ! docker ps | grep -q ${CONTAINER_ID}; then
    error "Контейнер не запустился"
    docker logs ${CONTAINER_ID}
    docker rm -f ${CONTAINER_ID}
    exit 1
fi

# Проверяем healthcheck
log "Проверяем healthcheck..."
for i in {1..30}; do
    if curl -f http://localhost:8080/ > /dev/null 2>&1; then
        success "Приложение доступно на http://localhost:8080"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Приложение не отвечает после 30 попыток"
        docker logs ${CONTAINER_ID}
        docker rm -f ${CONTAINER_ID}
        exit 1
    fi
    sleep 2
done

# Проверяем PWA файлы
log "Проверяем PWA файлы в контейнере..."
if curl -f http://localhost:8080/manifest.webmanifest > /dev/null 2>&1; then
    success "PWA манифест доступен"
else
    warning "PWA манифест недоступен"
fi

if curl -f http://localhost:8080/sw.js > /dev/null 2>&1; then
    success "Service Worker доступен"
else
    warning "Service Worker недоступен"
fi

# Останавливаем тестовый контейнер
docker rm -f ${CONTAINER_ID} > /dev/null 2>&1

success "Docker образ готов к использованию!"
log "Для запуска используйте:"
log "  docker run -d -p 8080:8080 ${IMAGE_NAME}:${TAG}"
log "  или"
log "  docker-compose up -d"

# Показываем команды для работы с образом
log ""
log "Полезные команды:"
log "  Просмотр логов: docker logs <container_id>"
log "  Вход в контейнер: docker exec -it <container_id> sh"
log "  Остановка: docker stop <container_id>"
log "  Удаление: docker rm <container_id>"
log "  Удаление образа: docker rmi ${IMAGE_NAME}:${TAG}"
