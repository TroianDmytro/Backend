#!/bin/bash

# Инициализация Docker Swarm и создание секретов
set -e

echo "🚀 Инициализация Docker Swarm для NestJS Backend"

# Проверяем статус Swarm
if docker info | grep -q "Swarm: active"; then
    echo "✅ Docker Swarm уже активен"
else
    echo "🔄 Инициализация Docker Swarm..."
    docker swarm init
    echo "✅ Docker Swarm инициализирован"
fi

# Показываем информацию о кластере
echo "📊 Информация о Swarm кластере:"
docker node ls

# Создаем overlay сеть
if ! docker network ls | grep -q "nestjs-network"; then
    echo "🌐 Создание overlay сети..."
    docker network create --driver overlay --attachable nestjs-network
    echo "✅ Сеть nestjs-network создана"
else
    echo "✅ Сеть nestjs-network уже существует"
fi

# Создаем секреты
echo "🔐 Запуск скрипта создания секретов..."
./scripts/create-secrets.sh

echo "🎉 Инициализация завершена!"
echo "💡 Теперь вы можете развернуть стек командой: ./scripts/deploy.sh"