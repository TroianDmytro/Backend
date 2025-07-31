#!/bin/bash
# deploy.sh - Скрипт для развертывания на сервере

set -e

echo "🚀 Начинаем развертывание NestJS Education Platform..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Проверяем наличие Docker и Docker Compose
check_requirements() {
    log "Проверяем системные требования..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен!"
        exit 1
    fi
    
    log "✅ Все требования выполнены"
}

# Создаем необходимые директории
setup_directories() {
    log "Создаем директории..."
    
    mkdir -p nginx/ssl nginx/logs frontend
    
    # Устанавливаем правильные права
    chmod 755 nginx
    chmod 644 nginx/nginx.conf 2>/dev/null || warn "nginx.conf не найден"
    
    log "✅ Директории созданы"
}

# Проверяем конфигурацию
check_config() {
    log "Проверяем конфигурацию..."
    
    if [ ! -f "docker-compose.yml" ]; then
        error "docker-compose.yml не найден!"
        exit 1
    fi
    
    if [ ! -f "nginx/nginx.conf" ]; then
        error "nginx/nginx.conf не найден!"
        exit 1
    fi
    
    log "✅ Конфигурация корректна"
}

# Получаем последний образ
pull_image() {
    log "Получаем последний образ..."
    
    docker-compose pull nestjs-backend || {
        error "Не удалось получить образ!"
        exit 1
    }
    
    log "✅ Образ получен"
}

# Останавливаем старые контейнеры
stop_old_containers() {
    log "Останавливаем старые контейнеры..."
    
    docker-compose down --remove-orphans || warn "Не удалось остановить контейнеры"
    
    log "✅ Старые контейнеры остановлены"
}

# Запускаем новые контейнеры
start_containers() {
    log "Запускаем контейнеры..."
    
    docker-compose up -d || {
        error "Не удалось запустить контейнеры!"
        exit 1
    }
    
    log "✅ Контейнеры запущены"
}

# Проверяем здоровье приложения
health_check() {
    log "Проверяем здоровье приложения..."
    
    # Ждем запуска
    sleep 10
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T nestjs-backend curl -f http://localhost:8000/api >/dev/null 2>&1; then
            log "✅ Приложение запущено и работает!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Приложение не отвечает после $max_attempts попыток!"
    docker-compose logs nestjs-backend
    exit 1
}

# Очищаем неиспользуемые образы
cleanup() {
    log "Очищаем неиспользуемые образы..."
    
    docker image prune -f || warn "Не удалось очистить образы"
    
    log "✅ Очистка завершена"
}

# Показываем статус
show_status() {
    log "Статус сервисов:"
    docker-compose ps
    
    echo ""
    log "Логи приложения (последние 20 строк):"
    docker-compose logs --tail=20 nestjs-backend
    
    echo ""
    log "🎉 Развертывание завершено успешно!"
    log "API доступно по адресу: https://nestneroyln.pp.ua/api"
    log "Swagger UI: https://nestneroyln.pp.ua/api-docs"
}

# Основная функция
main() {
    log "=== Развертывание NestJS Education Platform ==="
    
    check_requirements
    setup_directories
    check_config
    pull_image
    stop_old_containers
    start_containers
    health_check
    cleanup
    show_status
}

# Обработка ошибок
trap 'error "Произошла ошибка на строке $LINENO"' ERR

# Запускаем основную функцию
main "$@"

# update.sh - Скрипт для обновления приложения
cat > update.sh << 'EOF'
#!/bin/bash
# update.sh - Быстрое обновление приложения

set -e

echo "🔄 Обновление приложения..."

# Получаем новый образ
echo "📦 Получаем новый образ..."
docker-compose pull nestjs-backend

# Перезапускаем только backend
echo "🔄 Перезапускаем backend..."
docker-compose up -d nestjs-backend

# Проверяем здоровье
echo "🩺 Проверяем здоровье приложения..."
sleep 5

if docker-compose exec -T nestjs-backend curl -f http://localhost:8000/api >/dev/null 2>&1; then
    echo "✅ Обновление завершено успешно!"
else
    echo "❌ Что-то пошло не так. Проверьте логи:"
    docker-compose logs --tail=50 nestjs-backend
fi

# Очистка
docker image prune -f

echo "🎉 Готово!"
EOF

chmod +x update.sh

# backup.sh - Скрипт для создания резервных копий
cat > backup.sh << 'EOF'
#!/bin/bash
# backup.sh - Создание резервных копий

set -e

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "💾 Создаем резервную копию..."

# Бэкап volumes
echo "📁 Сохраняем файлы..."
docker run --rm -v nestjs_uploads:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/uploads.tar.gz -C /data .
docker run --rm -v nestjs_logs:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/logs.tar.gz -C /data .

# Бэкап конфигурации
echo "⚙️ Сохраняем конфигурацию..."
cp docker-compose.yml "$BACKUP_DIR/"
cp -r nginx "$BACKUP_DIR/"

echo "✅ Резервная копия создана в $BACKUP_DIR"
EOF

chmod +x backup.sh

echo "📝 Созданы скрипты:"
echo "  - deploy.sh - полное развертывание"
echo "  - update.sh - быстрое обновление"
echo "  - backup.sh - создание резервных копий"