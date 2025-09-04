# Courses & Subjects API Integration Guide

Документ для фронтенд / admin / owner / teacher панелей и автогенерации подсказок ИИ.

## 1. Аутентификация и роли
Authorization: `Bearer <JWT>` в заголовке.

Роли: `admin`, `owner`, `teacher`, (обычный пользователь без спец. ролей — только чтение и запись на курс).

Коды ошибок: 401 (нет токена / недействителен), 403 (роль или владение не подходят), 404 (ресурс не найден), 409 (конфликт состояния).

## 2. Базовый формат ответов
Успех (вариативно:
```
{
  "success": true,
  "message": "Описание",
  "course": { ... },
  "courses": [ ... ],
  "subjects": [ ... ],
  "subscription": { ... },
  "pagination": { "currentPage":1, "totalPages":5, ... }
}
```
Ошибка (NestJS):
```
{
  "statusCode": 403,
  "message": "Нет прав",
  "error": "Forbidden"
}
```

## 3. Сокращённая модель Course
```
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "category": "categoryId",
  "difficultyLevel": "difficultyLevelId",
  "mainTeacher": "userId",
  "price": 1000 | null,
  "language": "ru",
  "isPublished": true,
  "isActive": true,
  "isFeatured": false,
  "startDate": "2025-09-01T00:00:00.000Z" | null,
  "courseSubjects": [
     { "subject": "subjectId", "teacher": "teacherId"|null, "startDate": "2025-09-10T00:00:00.000Z"|null }
  ],
  "studentsCount": 42
}
```
`null` поля не подменяются значениями: если клиент отправляет `null`, сохраняется `null`.

## 4. Курсы – CRUD
| Method | Path | Роли | Описание |
|--------|------|------|----------|
| POST | /courses | admin, teacher | Создать курс (teacher только для себя) |
| GET | /courses | auth | Список с фильтрами |
| GET | /courses/:id | auth | Курс по ID |
| PUT | /courses/:id | admin, teacher(owner) | Обновить |
| DELETE | /courses/:id | admin, teacher(owner) | Удалить |

### 4.1 POST /courses
Body (CreateCourseDto — ключевые поля):
```
{
  "title": "Node.js Fundamentals",
  "description": "Базовый курс",
  "teacherId": "<teacherUserId>",
  "category": "<categoryId>",
  "difficultyLevel": "<difficultyLevelId>",
  "price": 1500,
  "language": "ru"
}
```
Teacher не может указать чужой `teacherId`.

### 4.2 GET /courses (фильтры)
Query параметры: `page, limit, category, difficulty_level, teacherId, minPrice, maxPrice, language, isPublished, isFeatured, search, tag`.
Ответ: `courses[] + pagination + filters`.

### 4.3 PUT /courses/:id
Partial update. Проверка владения (mainTeacher) для teacher.

### 4.4 DELETE /courses/:id
Нельзя если есть активные подписки (будет 409 — реализуйте проверку на фронте после ошибки).

## 5. Публикация курса
POST /courses/:id/publish
```
{ "isPublished": true }
```
Teacher: только если владелец + его учётка подтверждена и не заблокирована.

## 6. Копирование курса
POST /courses/:id/duplicate
```
{ "title": "Node.js Fundamentals (Copy)" }
```
Создаёт новый курс с копированием уроков (без студентов).

## 7. Стартовая дата курса
PUT /courses/:id/start-date (admin)
```
{ "startDate": "2025-10-01T09:00:00.000Z" }
```

## 8. Предметы курса: поэтапно
| Шаг | Endpoint | Body | Роли |
|-----|----------|------|------|
| 1 | POST /courses/:id/subjects | `{ "subjectId": "..." }` | admin, teacher |
| 2 | PUT /courses/:id/subjects/:subjectId/teacher | `{ "teacherId": "..." }` | admin, teacher |
| 3 | PUT /courses/:id/subjects/:subjectId/start-date | `{ "startDate": "ISO" }` | admin, teacher |
| Получить | GET /courses/:id/subjects | - | auth |
| Удалить | DELETE /courses/:courseId/subjects/:subjectId | admin, teacher(owner) |

Ответ на GET subjects:
```
{
  "success": true,
  "courseId": "...",
  "subjects": [
     { "subject": {"_id":"...","title":"..."}, "teacher": {"_id":"...","fullName":"..."}|null, "startDate": "..."|null }
  ]
}
```

## 9. Запись на курс
POST /courses/:id/enroll — пользователь сам.
Ответ: `{ success, message, subscription }`.

POST /courses/:id/admin-enroll (admin)
```
{ "userId": "<userId>", "forceEnroll": true }
```

## 10. Уроки и статистика
GET /courses/:id/lessons → `{ courseId, lessons: [...], totalLessons }`

GET /courses/:id/statistics (admin, teacher(owner))
→ `{ courseId, statistics: { ... } }`

## 11. Подборки / списки
| Endpoint | Описание |
|----------|----------|
| GET /courses/featured/list?limit=6 | Рекомендуемые |
| GET /courses/popular/list?limit=10 | Популярные |
| GET /courses/categories/list | Категории с counts |

## 12. Категории (3 режима)
| Endpoint | Роли | Режим |
|----------|------|-------|
| GET /courses/category/:categoryId | auth | card |
| GET /courses/category/:categoryId/full | auth | full |
| GET /courses/category/:categoryId/admin | admin, owner | admin |
Query: `page, limit` (defaults 1 / 12)

## 13. Уровни сложности (аналогично категориям)
```
GET /courses/difficulty/:id
GET /courses/difficulty/:id/full
GET /courses/difficulty/:id/admin   (admin, owner)
```
Query: `page, limit`

## 14. Ролевые сценарии (быстро)
- Admin: полный CRUD, назначение преподавателей, публикация, принудительная запись, админ-представления.
- Owner: чтение админ-представлений категорий/сложности (расширяемо).
- Teacher: создаёт только свои курсы, редактирует/публикует свои, управляет предметами, видит статистику своих.

## 15. Частые ошибки / UX советы
| Код | Причина | Рекомендация UI |
|-----|---------|-----------------|
| 400 | Валидация DTO | Подсветить поле, показать русское сообщение |
| 403 | Роль / владение | Скрывать кнопки действия заранее |
| 404 | Не найдено | Перенаправить на список / показать retry |
| 409 | Дубликат предмета / повторная запись | Показать текущий статус / disable кнопки |

## 16. Клиентские проверки
- Формат дат: `new Date().toISOString()`.
- Teacher перед POST /courses: гарантируйте teacherId == токен.userId.
- Nullable поля отправлять как `null`, не как пустую строку.
- После каждого изменения (publish, start-date) делать локальный optimistic update + последующий GET.

## 17. Краткая сводка эндпоинтов
| Method | Path | Роли |
|--------|------|------|
| POST | /courses | admin, teacher |
| GET | /courses | auth |
| GET | /courses/:id | auth |
| PUT | /courses/:id | admin, teacher(owner) |
| DELETE | /courses/:id | admin, teacher(owner) |
| POST | /courses/:id/publish | admin, teacher(owner) |
| POST | /courses/:id/subjects | admin, teacher |
| PUT | /courses/:id/subjects/:subjectId/teacher | admin, teacher |
| PUT | /courses/:id/subjects/:subjectId/start-date | admin, teacher |
| GET | /courses/:id/subjects | auth |
| DELETE | /courses/:courseId/subjects/:subjectId | admin, teacher(owner) |
| POST | /courses/:id/enroll | user |
| POST | /courses/:id/admin-enroll | admin |
| POST | /courses/:id/duplicate | admin, teacher |
| PUT | /courses/:id/start-date | admin |
| GET | /courses/:id/lessons | auth |
| GET | /courses/:id/statistics | admin, teacher(owner) |
| GET | /courses/featured/list | auth |
| GET | /courses/popular/list | auth |
| GET | /courses/categories/list | auth |
| GET | /courses/category/:id (+/full,/admin) | admin/owner для /admin |
| GET | /courses/difficulty/:id (+/full,/admin) | admin/owner для /admin |

## 18. Идеи для расширения
- Webhook / события (course.published, subject.assigned)
- Кэш списков (popular/featured)
- Прогресс студента на уровне курса
- Массовое назначение преподавателя для нескольких предметов

---
Документ можно автоматически парсить: заголовки разделов стабильны. При изменении API — добавляйте новый раздел CHANGELOG.
