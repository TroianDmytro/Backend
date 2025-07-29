#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Развертывание NestJS Backend"

# Переменные
STACK_NAME="nestjs-backend"
VERSION=${1:-latest}

# Экспорт переменных окружения
export VERSION=$VERSION
export APP_URL="https://nestneroyln.pp.ua" #TODO
export MONGODB_URI="mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/"
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT="587"
export EMAIL_USER="test.dpoff@gmail.com"
export EMAIL_FROM="test.dpoff@gmail.com"
export CORS_ORIGINS="https://nestneroyln.pp.ua"

echo "📦 Версия: $VERSION"
echo "🏷️  Стек: $STACK_NAME"

# Проверка секретов
echo "🔐 Проверка секретов..."
for secret in "nestjs_jwt_secret" "nestjs_email_password"; do
    if ! docker secret ls --format "{{.Name}}" | grep -q "^${secret}$"; then
        echo "❌ Секрет $secret не найден"
        echo "💡 Создайте секреты: ./scripts/create-secrets.sh"
        exit 1
    fi
done

# Развертывание
echo "🚀 Развертывание стека..."
docker stack deploy -c docker-stack.yml $STACK_NAME

# Проверка статуса
echo "⏳ Ожидание запуска..."
sleep 10

echo "📊 Статус сервисов:"
docker stack services $STACK_NAME

echo "✅ Развертывание завершено!"
echo "📝 Логи: docker service logs -f ${STACK_NAME}_nestjs-backend"