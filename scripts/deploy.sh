#!/bin/bash

# Скрипт деплоя в Docker Swarm
set -e

echo "🚀 Деплой NestJS Backend в Docker Swarm"

# Переменные
STACK_NAME="nestjs-backend"
VERSION=${1:-latest}
ENV_FILE=".env.production"

# Проверяем наличие env файла
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Файл окружения $ENV_FILE не найден"
    echo "💡 Создайте файл на основе .env.example"
    exit 1
fi

# Загружаем переменные окружения
echo "📁 Загрузка переменных окружения из $ENV_FILE"
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Устанавливаем версию образа
export VERSION=$VERSION

echo "📦 Версия образа: $VERSION"
echo "🏷️  Имя стека: $STACK_NAME"

# Проверяем наличие секретов
echo "🔐 Проверка секретов..."
required_secrets=("nestjs_mongodb_password" "nestjs_jwt_secret" "nestjs_email_password")

for secret in "${required_secrets[@]}"; do
    if ! docker secret ls --format "{{.Name}}" | grep -q "^${secret}$"; then
        echo "❌ Секрет $secret не найден"
        echo "💡 Создайте секреты командой: ./scripts/create-secrets.sh"
        exit 1
    fi
done

echo "✅ Все секреты найдены"

# Деплой стека
echo "🚀 Деплой стека..."
docker stack deploy -c docker-stack.yml $STACK_NAME

# Ждем запуска сервисов
echo "⏳ Ожидание запуска сервисов..."
sleep 10

# Показываем статус
echo "📊 Статус сервисов:"
docker stack services $STACK_NAME

echo "📋 Контейнеры:"
docker stack ps $STACK_NAME

echo "✅ Деплой завершен!"
echo "🌍 Приложение должно быть доступно по адресу: $APP_URL"
echo "📊 Мониторинг: docker stack ps $STACK_NAME"
echo "📝 Логи: docker service logs -f ${STACK_NAME}_nestjs-backend"