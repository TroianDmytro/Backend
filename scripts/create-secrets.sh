#!/bin/bash
# scripts/create-secrets.sh

echo "🔐 Создание Docker секретов для NestJS Backend"

# Проверяем Docker Swarm
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Docker Swarm не активен. Инициализируйте: docker swarm init"
    exit 1
fi

# Функция создания секрета
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    # Удаляем если существует
    docker secret rm "$secret_name" 2>/dev/null || true
    
    # Создаем новый секрет
    echo "$secret_value" | docker secret create "$secret_name" -
    echo "✅ Секрет '$secret_name' создан"
}

# JWT секрет
JWT_SECRET="cd2c18d6c7f64a37a1a404c4d4c5a75ee76ec2b13949e3a67e1e0e1a3cf6a8db"
create_secret "nestjs_jwt_secret" "$JWT_SECRET"

# Email пароль
EMAIL_PASSWORD="lplj ubop uudh fpjg"
create_secret "nestjs_email_password" "$EMAIL_PASSWORD"

echo "📋 Созданные секреты:"
docker secret ls | grep nestjs_