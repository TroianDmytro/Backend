# Многоэтапная сборка для оптимизации размера образа
FROM node:23.10.0-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости для компиляции
RUN apk add --no-cache python3 make g++ vips-dev libc6-compat

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Копируем исходный код
COPY . .

# Компилируем приложение
RUN npm run build

# Очищаем dev зависимости
RUN npm prune --production && npm cache clean --force

# Финальный этап - production образ
FROM node:23.10.0-alpine AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем только runtime зависимости
RUN apk add --no-cache \
    vips \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Создаем пользователя без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Создаем необходимые директории
RUN mkdir -p uploads temp logs && \
    chown -R nestjs:nodejs /app

# Копируем скомпилированное приложение из builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Копируем healthcheck скрипт
#COPY --chown=nestjs:nodejs healthcheck.js ./

# Переключаемся на пользователя без root
USER nestjs

# Открываем порт
EXPOSE 8000

# Добавляем labels для метаданных
LABEL maintainer="your-email@example.com"
LABEL version="1.0.0"
LABEL description="NestJS Education Platform API"

# Healthcheck
#HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
 # CMD node healthcheck.js

# Используем dumb-init для правильного управления процессами
ENTRYPOINT ["dumb-init", "--"]

# Запускаем приложение
CMD ["node", "dist/src/main.js"]