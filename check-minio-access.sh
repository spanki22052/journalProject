#!/bin/bash

echo "Проверка доступа к MinIO..."

# Проверяем, что MinIO запущен
echo "1. Проверка доступности MinIO..."
curl -f http://localhost:9000/minio/health/live
if [ $? -eq 0 ]; then
    echo "✅ MinIO доступен"
else
    echo "❌ MinIO недоступен"
    exit 1
fi

# Проверяем bucket
echo "2. Проверка bucket chat-files..."
curl -f http://localhost:9000/chat-files/
if [ $? -eq 0 ]; then
    echo "✅ Bucket chat-files доступен"
else
    echo "❌ Bucket chat-files недоступен"
fi

# Проверяем CORS
echo "3. Проверка CORS..."
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:9000/chat-files/
if [ $? -eq 0 ]; then
    echo "✅ CORS настроен"
else
    echo "❌ CORS не настроен"
fi

echo "Проверка завершена!"
