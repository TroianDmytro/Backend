#Dockerfile
# Используем официальный Node.js образ
FROM node:18-alpine AS base

# Устанавливаем необходимые системные пакеты
RUN apk add --no-cache dumb-init curl

# Создаем пользователя без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Этап установки зависимостей
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Этап сборки
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production образ
FROM base AS production
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Копируем вспомогательные скрипты
COPY healthcheck.js ./
COPY scripts/wait-for-mongo.js ./scripts/

# Устанавливаем права
RUN chown -R nestjs:nodejs /app
USER nestjs

# Открываем порт
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node healthcheck.js

# Запуск с dumb-init для правильной обработки сигналов
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node scripts/wait-for-mongo.js && node dist/main.js"]