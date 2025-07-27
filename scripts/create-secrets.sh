#!/bin/bash

# Скрипт создания Docker секретов
set -e

echo "🔐 Создание Docker секретов для NestJS Backend"

# Проверяем, что мы в Docker Swarm режиме
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Docker Swarm не активен. Инициализируйте Swarm с помощью: docker swarm init"
    exit 1
fi

# Функция для создания секрета
create_secret() {
    local secret_name=$1
    local secret_file=$2
    
    if [ ! -f "$secret_file" ]; then
        echo "❌ Файл секрета $secret_file не найден"
        return 1
    fi
    
    # Удаляем секрет если он уже существует
    if docker secret ls --format "{{.Name}}" | grep -q "^${secret_name}$"; then
        echo "🗑️  Удаляем существующий секрет: $secret_name"
        docker secret rm "$secret_name"
    fi
    
    # Создаем новый секрет
    echo "✅ Создаем секрет: $secret_name"
    docker secret create "$secret_name" "$secret_file"
}

# Создаем директорию для секретов если её нет
mkdir -p secrets

# Проверяем наличие файлов секретов
echo "📁 Проверка файлов секретов..."

# MongoDB пароль
if [ ! -f "secrets/mongodb-password.txt" ]; then
    echo "🔑 Введите пароль для MongoDB:"
    read -s mongodb_password
    echo "$mongodb_password" > secrets/mongodb-password.txt
    echo "✅ Пароль MongoDB сохранен"
fi

# JWT секрет
if [ ! -f "secrets/jwt-secret.txt" ]; then
    echo "🔑 Генерируем JWT секрет..."
    openssl rand -base64 64 > secrets/jwt-secret.txt
    echo "✅ JWT секрет сгенерирован"
fi

# Email пароль
if [ ! -f "secrets/email-password.txt" ]; then
    echo "🔑 Введите пароль для email:"
    read -s email_password
    echo "$email_password" > secrets/email-password.txt
    echo "✅ Пароль email сохранен"
fi

# Создаем секреты в Docker
echo "🔐 Создание Docker секретов..."
create_secret "nestjs_mongodb_password" "secrets/mongodb-password.txt"
create_secret "nestjs_jwt_secret" "secrets/jwt-secret.txt"
create_secret "nestjs_email_password" "secrets/email-password.txt"

# Список созданных секретов
echo "📋 Созданные секреты:"
docker secret ls

echo "✅ Все секреты успешно созданы!"
echo "⚠️  Не забудьте удалить файлы секретов после создания или добавить их в .gitignore"