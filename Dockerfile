# Dockerfile
# Этап 1: Базовый образ
FROM node:23.10.0-alpine AS base

# Устанавливаем необходимые системные пакеты
RUN apk add --no-cache dumb-init curl

# Создаем пользователя без root прав для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Этап 2: Установка зависимостей
FROM base AS deps
WORKDIR /app

# Копируем файлы package.json для кеширования слоя зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Этап 3: Сборка приложения
FROM base AS builder
WORKDIR /app

# Копируем package.json и устанавливаем все зависимости для сборки
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# ВАЖНО: Компилируем TypeScript в JavaScript
RUN npm run build

# Этап 4: Production образ
FROM base AS production
WORKDIR /app

# Копируем зависимости из deps этапа
COPY --from=deps /app/node_modules ./node_modules

# Копируем собранное приложение из builder этапа
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Копируем вспомогательные скрипты
COPY healthcheck.js ./
COPY scripts/wait-for-mongo.js ./scripts/
# COPY scripts/read-secrets.js ./scripts/

# Создаем директорию для загрузок
RUN mkdir -p uploads && chown -R nestjs:nodejs /app

# Переключаемся на пользователя без root прав
USER nestjs

# Открываем порт
EXPOSE 8000

# Health check для проверки состояния приложения
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node healthcheck.js

# Запуск приложения с обработкой сигналов
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node scripts/wait-for-mongo.js && node dist/src/main.js"]