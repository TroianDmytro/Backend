# Полная Интеграционная Инструкция Backend API

Документ для разработки: Admin Panel, Owner Panel, Teacher Dashboard, Student Frontend, а также для ИИ-агентов (генерация форм / валидация / автоподсказки).

## 0. Общая архитектура
- Framework: NestJS + Mongoose
- Аутентификация: JWT (Header `Authorization: Bearer <token>`), Google OAuth
- Роли: `admin`, `owner`, `teacher`, (пользователь без спец. роли = студент)
- Правило null: если клиент отправил `null` в DTO для опционального поля — сохраняем `null` (не подменяем дефолтами)
- Swagger: `/api/docs`

## 1. Аутентификация и безопасность
| Endpoint | Method | Public | Описание |
|----------|--------|--------|----------|
| /auth/register/send-code | POST | yes | Шаг 1 — отправка кода на email |
| /auth/register/verify-code | POST | yes | Шаг 2 — подтверждение и завершение регистрации |
| /auth/resend-code | POST | yes | Повторная отправка кода |
| /auth/login | POST | yes | Логин (по login+password) |
| /auth/forgot-password | POST | yes | Запрос восстановления |
| /auth/reset-password | POST | yes | Сброс пароля по коду |
| /auth/change-password | POST | no | Смена пароля авторизованным |
| /auth/verify-email?token= | GET | yes | Устаревшая email-варификация |
| /auth/google | GET | yes | Начало Google OAuth |
| /auth/google/callback | GET | yes | Callback Google |
| /auth/google/status | GET | no | Статус привязки Google |
| /auth/google/link | POST | no | Связать Google (WIP) |
| /auth/google/unlink | POST | no | Отвязать Google |

Стандартный успешный ответ авторизации (login / google):
```
{
  "access_token": "<JWT>",
  "user": {
     "id": "...",
     "email": "...",
     "login": "...",
     "roles": ["teacher"]
  }
}
```

## 2. Пользователи / Преподаватели / Роли
(Предполагаемые контроллеры `users`, `teachers`, `roles` — кратко; расширить при необходимости.)

Примеры операций (типично):
- GET /users (admin)
- GET /users/:id (admin/self)
- PUT /users/:id (admin/self)
- Управление ролями: /roles (admin)
- Преподавательские заявки / approve / block: в `teachers` (admin)

Рекомендация: фронтенд кэширует собственный профиль после логина; обновляет при смене пароля / привязке Google.

## 3. Курсы и предметы
Полная документация в `COURSES_API_INTEGRATION.md`.
Ключевые моменты:
- Пошаговое добавление предметов (3 шага)
- Публикация только владельцем или admin
- Запись: обычная и административная

Основные эндпоинты (сводно):
```
POST /courses
GET /courses
GET /courses/:id
PUT /courses/:id
DELETE /courses/:id
POST /courses/:id/publish
POST /courses/:id/subjects (шаг 1)
PUT /courses/:id/subjects/:subjectId/teacher (шаг 2)
PUT /courses/:id/subjects/:subjectId/start-date (шаг 3)
GET /courses/:id/subjects
DELETE /courses/:courseId/subjects/:subjectId
POST /courses/:id/enroll
POST /courses/:id/admin-enroll
POST /courses/:id/duplicate
PUT /courses/:id/start-date
GET /courses/:id/lessons
GET /courses/:id/statistics
```

## 4. Уроки и посещаемость
| Endpoint | Method | Роли | Описание |
|----------|--------|------|----------|
| /lessons | POST | teacher, admin | Создать урок (в рамках курса / предмета) |
| /lessons/:id | GET | auth | Просмотр урока |
| /lessons/:id | PUT | teacher(owner), admin | Обновить |
| /lessons/:id | DELETE | teacher(owner), admin | Удалить |
| /lessons/:id/schedule | PUT | teacher(owner), admin | Изменить дату/время |
| /lessons/:id/attendance | POST | teacher(owner), admin | Отметить присутствие студентов + оценка |
| /lessons/:id/attendance | GET | teacher(owner), admin | Получить посещаемость |

Тип отметки посещаемости (пример):
```
POST /lessons/:id/attendance
{
  "students": [
     { "studentId": "u1", "present": true, "lessonGrade": 95 },
     { "studentId": "u2", "present": false, "lessonGrade": null }
  ]
}
```

## 5. Домашние задания (Homework)
Workflow: создать → студенты видят → отправляют → преподаватель проверяет / оценивает.
| Endpoint | Method | Роли | Описание |
|----------|--------|------|----------|
| /homework | POST | teacher, admin | Создать ДЗ (файл PDF) |
| /homework/:id | GET | auth (участники курса) | Просмотр ДЗ |
| /homework/:id/submit | POST | student | Отправка ZIP/файлов решения |
| /homework/submissions/:id | GET | teacher/admin | Просмотр отправки |
| /homework/submissions/:id/review | POST | teacher/admin | Оценка + комментарий |

Пример отправки решения (multipart):
- Form field: `files[]` (ZIP / вложения)
Ответ проверки:
```
{
  "success": true,
  "grade": 88,
  "comment": "Хорошо выполнено"
}
```

## 6. Предметы / Категории / Уровни сложности
| Resource | Базовые операции |
|----------|------------------|
| subjects | CRUD (GET публичный список, POST protected) |
| categories | CRUD (admin) + публичный список для фильтрации |
| difficulty-levels | CRUD (admin) + публичный список |

Используются в курсах (фильтрация и классификация).

## 7. Подписки и планы
(Схема предполагает монетизацию.)
| Endpoint | Method | Роли | Описание |
|----------|--------|------|----------|
| /subscription-plans | GET | auth | Список планов |
| /subscription-plans | POST | admin | Создать план |
| /subscription-plans/:id | PUT | admin | Обновить |
| /subscription-plans/:id | DELETE | admin | Удалить |
| /subscriptions | GET | user/admin | Мои подписки / (admin — фильтры) |
| /subscriptions | POST | user | Оформить подписку |
| /subscriptions/:id/cancel | POST | user/admin | Отмена |

## 8. Платежи (Monobank интеграция)

Актуальный базовый путь: `/payments` (ранее в черновиках использовалось `/payment` — НЕ ИСПОЛЬЗОВАТЬ).

| Method | Path | Auth | Роли | Описание |
|--------|------|------|------|----------|
| GET | /payments/success?invoiceId=&status= | public | - | HTML страница успешной оплаты (редирект из банка) |
| GET | /payments/failure?invoiceId= | public | - | HTML страница ошибки оплаты |
| POST | /payments/create | JWT | user, admin | Создать платеж (инициировать invoice в Monobank) |
| GET | /payments/:id | JWT | user (владелец), admin | Получить платеж по внутреннему ID |
| GET | /payments/subscription/:subscriptionId | JWT | user (владелец), admin | Платежи конкретной подписки |
| GET | /payments/user/:userId | JWT | admin / (user только свои) | Платежи пользователя с пагинацией |
| PUT | /payments/:id/cancel | JWT | user (владелец), admin | Отмена платежа (если разрешено) |
| POST | /payments/webhook | public (подпись) | - | Вебхук Monobank (обновление статуса) |
| POST | /payments/:invoiceId/sync | JWT | admin | Принудительная синхронизация статуса из Monobank |

Создание платежа (пример):
```
POST /payments/create
{
  "subscriptionId": "<subscriptionId>",
  "amount": 1500,
  "currency": "UAH",
  "description": "Подписка STANDARD",
  "redirectUrl": "https://frontend/app/after-pay" // опционально
}
```
Ответ:
```
{
  "message": "Платеж создан успешно",
  "payment": { "id": "...", "status": "created", "invoiceId": "..." },
  "pageUrl": "https://pay.monobank.ua/...." // открыть во вкладке или сделать window.location
}
```

Webhook (обязательно проверяйте подпись `x-sign`):
```
POST /payments/webhook (raw JSON)
Headers: x-sign: <hex/hmac>
Body пример Monobank:
{
  "invoiceId": "...",
  "status": "success", // or processing / failure / expired
  "amount": 150000,      // копейки
  "ccy": 980,
  ...
}
```
Ответ: `{ "status": "ok" }` или 400 при невалидной подписи.

Статусы (внутренние): `created | processing | success | canceled | failure | expired`.

Рекомендованный клиентский поток:
1. Пользователь выбирает план → вызывает `POST /payments/create`.
2. Получает `pageUrl` → открывает (новая вкладка или redirect).
3. После оплаты Monobank редиректит на `/payments/success?...` или `/payments/failure?...`.
4. Фронтенд может опросить `GET /payments/:id` или вызывать `GET /payments/subscription/:subscriptionId` для обновления UI.
5. Админ панель может периодически дергать `POST /payments/:invoiceId/sync` при расхождениях.

Защита от подмены: не доверять только фронтовому редиректу, окончательный статус брать из `GET /payments/:id` (или по подписке) после обработки вебхука.

Пример нормализованного ответа платежа во фронт после чтения:
```
{
  "payment": {
    "id": "...",
    "invoiceId": "...",
    "status": "success",
    "statusDescription": "Оплачен",
    "amount": 150000,
    "currency": "UAH",
    "subscriptionId": "...",
    "createdAt": "2025-09-04T10:15:00.000Z"
  }
}
```

UI подсказки:
- Показывать кнопку "Обновить статус" → дергает `POST /payments/:invoiceId/sync` (только admin) или простой повторный GET.
- При статусе `processing` — отображать спиннер + CTA "Проверить".
- При `failure` предлагать повторное создание платежа.

Ошибки:
- 400 `Invalid signature` при неверной подписи вебхука.
- 404 если платеж не найден.

## 9. Аватары и файлы
| Endpoint | Method | Роли | Описание |
|----------|--------|------|----------|
| /avatars | POST | auth | Загрузка нового аватара (image) |
| /avatars/:id | GET | public/auth | Получение (может быть публично) |
| /avatars/:id | DELETE | auth | Удалить свой / admin чужой |

Обработка изображений: Sharp (ресайз, форматы). Хранение в `uploads/`.

## 10. Общая модель ролей / прав
| Роль | Возможности |
|------|-------------|
| admin | Полный доступ ко всем ресурсам |
| owner | Расширенный просмотр админских представлений (категории/сложности) |
| teacher | Управляет только своими курсами, уроками, ДЗ, посещаемостью |
| student | Просмотр, участие, отправка ДЗ |

Проверки владения: по `mainTeacher` курса или наличию студента в подписке.

## 11. Ответы и пагинация
Стандарт:
```
{
  "courses": [...],
  "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42,
      "itemsPerPage": 10
  }
}
```

## 12. Ошибки (глобально)
| Код | Причина |
|-----|---------|
| 400 | Некорректные данные / просроченный код |
| 401 | Нет / неправильный JWT |
| 403 | Нет прав (роль / владение) |
| 404 | Ресурс не найден |
| 409 | Конфликт (дубликат, уже записан, предмет добавлен) |

## 13. Клиентские рекомендации
- Кэшировать токен + user.profile в localStorage / memory
- Обновлять профиль после действий: смена пароля, привязка Google, изменение ролей (admin UI)
- Для teacher при создании курса всегда подставлять свой ID
- Nullable поля отправлять `null` (не "")
- Использовать ISO с таймзоной: `new Date().toISOString()`
- При 403 скрывать соответствующие UI элементы на последующих рендерах

## 14. Быстрый словарь ключевых коллекций (Mongo)
| Коллекция | Значение |
|-----------|----------|
| users | Аккаунты (email/login, роли, флаги подтверждения) |
| teachers | Доп. профиль преподавателя / модерация |
| courses | Курсы, связь subjects, расписание стартов |
| subjects | Предметы / тематики |
| lessons | Уроки (дата, время, привязка к курсу/предмету) |
| homework | Домашние задания |
| homework_submissions | Ответы студентов |
| subscription_plans | Тарифные планы |
| subscriptions | Активные подписки / доступ к курсам |
| payments | Платежные операции / статусы |

## 15. Интеграция Google OAuth (кратко)
1. Клиент вызывает `/auth/google` → редирект на Google
2. Callback `/auth/google/callback` выдаёт токен → редирект на фронт (или debug HTML)
3. Фронт извлекает `token` из query → сохраняет → использует далее как обычный JWT
4. Проверка статуса: `/auth/google/status`

## 16. Расширения и идеи
- WebSocket: трансляция статусов урока / онлайн студентов
- Notifications: события (new_homework, lesson_updated)
- Audit trail: запись админских операций
- Rate limiting / throttling публичных auth endpoints

## 17. CHANGELOG (начать вести)
Добавляйте сюда изменения API:
- [2025-09-04] Введена пошаговая схема добавления предметов к курсу.
- [2025-09-04] Документы интеграции добавлены.
- [2025-09-05] Удалён legacy контроллер course-subjects и устаревший GET /auth/verify-email.

## 18. Полный перечень эндпоинтов (инвентаризация)

Формат: METHOD  PATH  (Кратко)

### Auth
GET /auth/google
GET /auth/test/config
GET /auth/test
GET /auth/google/callback
GET /auth/google/status
POST /auth/google/link
POST /auth/google/unlink
POST /auth/register/send-code
POST /auth/register/verify-code
POST /auth/login
POST /auth/resend-code
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password

### Courses
POST /courses
GET  /courses
GET  /courses/:id
PUT  /courses/:id
DELETE /courses/:id
POST /courses/:id/publish
POST /courses/:id/subjects               (шаг 1)
PUT  /courses/:id/subjects/:subjectId/teacher    (шаг 2)
PUT  /courses/:id/subjects/:subjectId/start-date (шаг 3)
GET  /courses/:id/subjects
DELETE /courses/:courseId/subjects/:subjectId
POST /courses/:id/duplicate
POST /courses/:id/enroll
POST /courses/:id/admin-enroll
PUT  /courses/:id/start-date
GET  /courses/:id/lessons
GET  /courses/:id/statistics
GET  /courses/:id/students
GET  /courses/featured/list
GET  /courses/popular/list
GET  /courses/categories/list
GET  /courses/category/:categoryId
GET  /courses/category/:categoryId/full
GET  /courses/category/:categoryId/admin
GET  /courses/difficulty/:difficultyLevelId
GET  /courses/difficulty/:difficultyLevelId/full
GET  /courses/difficulty/:difficultyLevelId/admin


### Lessons
POST /lessons
GET  /lessons/:id (если реализовано, иначе получить через курс)
PUT  /lessons/:id
DELETE /lessons/:id
PUT  /lessons/:id/schedule
POST /lessons/:id/attendance
GET  /lessons/:id/attendance

### Homework
POST /homework
GET  /homework/:id
POST /homework/:id/submit
PUT  /homework/submissions/:submissionId/review

### Subjects
GET  /subjects
GET  /subjects/:id
POST /subjects
PUT  /subjects/:id
DELETE /subjects/:id
GET  /subjects/:id/materials
POST /subjects/:id/materials
DELETE /subjects/:subjectId/materials/:materialId

### Teachers
POST /teachers
GET  /teachers
GET  /teachers/:id
PUT  /teachers/:id
DELETE /teachers/:id
POST /teachers/:id/approve
POST /teachers/:id/block
POST /teachers/:teacherId/courses/:courseId (assign?)
DELETE /teachers/:teacherId/courses/:courseId
GET  /teachers/:id/statistics
GET  /teachers/:id/courses
GET  /teachers/pending/applications

### Users
GET  /users/:id
PUT  /users/:id
DELETE /users/:id
POST /users/:userId/roles/:roleId
DELETE /users/:userId/roles/:roleId
GET  /users (листинг)
POST /users/:id/confirm-email-change
POST /users/:id/resend-email-change-code
POST /users/:id/cancel-email-change
GET  /users/:id/email-change-status

### Roles
(Создание/удаление может быть ограничено; удалить закомментировано
в контроллере — актуализировать при включении.)

### Subscription Plans
GET  /subscription-plans
GET  /subscription-plans/popular
GET  /subscription-plans/featured
GET  /subscription-plans/:id
GET  /subscription-plans/slug/:slug
POST /subscription-plans
PUT  /subscription-plans/:id
DELETE /subscription-plans/:id
PUT  /subscription-plans/:id/activate
POST /subscription-plans/seed
POST /subscription-plans/recreate
GET  /subscription-plans/statistics/overview

### Subscriptions
POST /subscriptions
GET  /subscriptions
GET  /subscriptions/:id
DELETE /subscriptions/:id
POST /subscriptions/:id/cancel
POST /subscriptions/:id/renew
POST /subscriptions/:id/activate
POST /subscriptions/:id/pay
GET  /subscriptions/user/:userId
GET  /subscriptions/course/:courseId
GET  /subscriptions/statistics/overview
POST /subscriptions/expire-check
POST /subscriptions/enroll
POST /subscriptions/admin-enroll
PUT  /subscriptions/:id
PUT  /subscriptions/:id/status

### Payments
GET  /payments/success
GET  /payments/failure
POST /payments/create
GET  /payments/:id
GET  /payments/subscription/:subscriptionId
GET  /payments/user/:userId
PUT  /payments/:id/cancel
POST /payments/webhook
POST /payments/:invoiceId/sync


### Difficulty Levels
PUT  /difficulty-levels/:id
DELETE /difficulty-levels/:id
// Остальные CRUD endpoints (GET list, POST create) если существуют

### Categories
PUT  /categories/:id
DELETE /categories/:id
// Остальные CRUD аналогично

### Avatars
POST /avatars
PUT  /avatars/replace/:userId
DELETE /avatars/:userId
GET  /avatars/:id (если публично настроено через static serving)

---
Примечания:
1. Маршруты, помеченные комментариями, требуют уточнения/активации.
2. Дубли / устаревшие (legacy) контроллеры обозначены — планируйте консолидацию.
3. При изменении перечня обязательно синхронизируйте эту секцию и CHANGELOG.

## 19. Типы передаваемых значений, ответы и ошибки

### 19.1 Общие соглашения
| Элемент | Тип | Описание |
|---------|-----|----------|
| ObjectId | string (24 hex) | Mongo идентификатор |
| Date ISO | string (ISO 8601) | Временная метка UTC (`2025-09-04T12:30:00.000Z`) |
| Nullable | value \| null | Поле может быть `null` (отправлять именно `null`) |
| Money (minor) | number | Сумма в минимальных единицах (копейки) |
| Money (human) | number | Сумма в целых (UAH) – вход пользователя |

Стандарт успешного ответа (вариант коллекции):
```
{
  "data": <payload>,
  "pagination?: { currentPage, totalPages, totalItems, itemsPerPage }"
}
```
Если используется иной ключ (например `courses`, `payments`) — это именованный список ресурса.

Стандарт ошибки Nest (глобально):
```
{
  "statusCode": 400,
  "message": ["<msg>"] | "<msg>",
  "error": "Bad Request"
}
```

### 19.2 Коды и типы ошибок (общее)
| Код | Error | Тип | Триггер |
|-----|-------|-----|---------|
| 400 | Bad Request | ValidationError | class-validator нарушения / неверная подпись вебхука |
| 401 | Unauthorized | AuthError | Отсутствует / просрочен JWT |
| 403 | Forbidden | AccessError | Нет роли / не владелец ресурса |
| 404 | Not Found | NotFoundError | Ресурс отсутствует |
| 409 | Conflict | ConflictError | Дубликат, уже записан, конфликт состояния |
| 422 | Unprocessable Entity | DomainError | (Опционально) бизнес-логика, если добавите |
| 500 | Internal Server Error | InternalError | Необработанное исключение |

### 19.3 Auth DTO
| Endpoint | Body Type | Body Поля | Response 200 | Ошибки |
|----------|-----------|-----------|-------------|--------|
| POST /auth/register/send-code | SendRegisterCodeDto | email:string | { message:string } | 400 (email invalid), 409 (already exists) |
| POST /auth/register/verify-code | VerifyRegisterCodeDto | email:string, code:string, login:string, password:string | { access_token, user } | 400 (bad code), 409 (login exists) |
| POST /auth/login | LoginDto | login:string, password:string | { access_token, user } | 400 (bad credentials) |
| POST /auth/change-password | ChangePasswordDto | oldPassword:string, newPassword:string | { message } | 400 (weak), 403 (mismatch) |
| POST /auth/forgot-password | ForgotPasswordDto | email:string | { message } | 404 (user not found) |
| POST /auth/reset-password | ResetPasswordDto | email:string, code:string, newPassword:string | { message } | 400 (code invalid) |

User (response fragment):
```
interface UserPublic {
  id: string;
  email: string;
  login: string;
  roles: string[]; // ['teacher', 'admin']
  avatarUrl?: string | null;
}
```

### 19.4 Courses DTO
Create:
```
interface CreateCourseDto {
  title: string;
  description?: string | null;
  categoryId?: string | null;
  difficultyLevelId?: string | null;
  startDate?: string | null; // ISO
  maxStudents?: number | null;
  mainTeacherId?: string | null;
  price?: number | null; // в гривнах (human)
}
```
Update: `Partial<CreateCourseDto>`

Add subject (шаг 1):
```
POST /courses/:id/subjects
{ "subjectId": string }
```
Assign teacher (шаг 2): `{ "teacherId": string | null }`
Start date (шаг 3): `{ "startDate": string | null }`

Enrollment:
```
POST /courses/:id/enroll { "paymentId": string }
admin-enroll: { "userId": string }
```
Response (пример курса):
```
interface Course {
  id: string; title: string; published: boolean;
  courseSubjects: Array<{
     subjectId: string;
     teacherId?: string | null;
     startDate?: string | null;
  }>;
  studentsCount: number;
  startDate?: string | null;
  createdAt: string; updatedAt: string;
}
```
Ошибки: 404 (course/subject), 409 (subject duplicate), 403 (not owner), 400 (capacity reached / already enrolled).

### 19.5 Lessons / Attendance DTO
Create lesson:
```
interface CreateLessonDto {
  courseId: string;
  subjectId?: string | null;
  title: string;
  date: string; // ISO date (start)
  startTime?: string | null; // HH:MM
  endTime?: string | null;   // HH:MM
  description?: string | null;
}
```
Attendance mark:
```
interface MarkAttendanceDto {
  students: Array<{
    studentId: string;
    present: boolean;
    lessonGrade?: number | null; // 0..100
  }>;
}
```
Errors: 404 (lesson/student), 403 (not lesson teacher), 400 (time invalid).

### 19.6 Homework DTO
Create:
```
interface CreateHomeworkDto {
  courseId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
}
// +multipart field: file (PDF)
```
Submit solution: multipart `files[]: zip|pdf|img` + body optional comment.
Review:
```
interface ReviewSubmissionDto {
  grade: number; // 0..100
  comment?: string | null;
}
```
Errors: 403 (not participant / not teacher), 404 (homework/submission), 400 (invalid grade).

### 19.7 Payments DTO
Create:
```
interface CreatePaymentDto {
  subscriptionId: string;
  amount: number;      // human UAH
  currency: 'UAH' | 'USD' | 'EUR';
  description: string;
  redirectUrl?: string | null;
}
```
Response create:
```
{
  message: string;
  payment: Payment;
  pageUrl: string; // открыть пользователю
}
```
`Payment`:
```
interface Payment {
  id: string;
  invoiceId: string;
  status: 'created' | 'processing' | 'success' | 'canceled' | 'failure' | 'expired';
  amount: number;        // minor units? (уточните консистентно)
  currency: string;
  subscriptionId: string;
  description?: string | null;
  createdAt: string; updatedAt: string;
}
```
Webhook body (частично): `{ invoiceId:string, status:string, amount:number, ccy:number }`
Errors: 400 (Invalid signature), 404 (payment not found), 409 (already canceled), 403 (cancel not owner).

### 19.8 Subscriptions DTO
Create:
```
interface CreateSubscriptionDto {
  planId: string;
  userId?: string; // admin может задать
  startDate?: string | null;
}
```
Cancel: POST `/subscriptions/:id/cancel` (body optional `{ reason?: string }`).
Enroll (если используется для курса): `{ courseId: string }`.
Errors: 404 (plan/subscription), 409 (already active), 403 (not owner), 400 (invalid dates).

### 19.9 Subjects & Study Materials DTO
Create subject:
```
interface CreateSubjectDto {
  title: string;
  description?: string | null;
}
```
Add material:
```
interface AddStudyMaterialDto {
  type: 'video' | 'pdf' | 'zip' | 'link';
  title: string;
  url?: string | null;    // для video/link
  fileId?: string | null; // если загружен файл
  description?: string | null;
}
```
Errors: 400 (unsupported type), 404 (subject/material), 403 (not teacher/admin).

### 19.10 Common Query Params
| Param | Тип | Где | Описание |
|-------|-----|-----|----------|
| page | number (>=1) | query | Номер страницы |
| limit | number (1..100) | query | Размер страницы |
| search | string | query | Поисковая фильтрация (если поддерживается) |
| sort | string | query | Поле сортировки (например: `createdAt:desc`) |

### 19.11 Унифицированные правила валидации
| Поле | Правило |
|------|---------|
| email | RFC email + lowercase trim |
| password | >=8 символов (рекомендация) |
| title | 1..200 символов |
| description | <=5000 символов |
| grade | 0..100 |

### 19.12 Примеры ошибок в домене
| Сценарий | Код | message |
|----------|-----|---------|
| Повторная запись на курс | 409 | "Пользователь уже записан" |
| Предмет уже добавлен | 409 | "Предмет уже присутствует в курсе" |
| Лимит студентов достигнут | 400 | "Достигнут лимит студентов" |
| Нет доступа к ресурсу | 403 | "Недостаточно прав" |
| Платеж не найден | 404 | "Платеж не найден" |
| Неверная подпись вебхука | 400 | "Invalid signature" |

### 19.13 Рекомендации для автогенерации типов на фронтенде
1. Считать раздел 19 каноничным источником TS интерфейсов.
2. Генерировать d.ts из Markdown (скриптом) — парсить блоки ```interface.
3. Для DTO обновлять версии при CHANGELOG записях (семантический тег в комментарии: `// v1` → `// v2`).
4. При расширении enum статусов платежа — обновить раздел 19.7 и CHANGELOG.

### 19.14 Минимальный клиентский враппер (псевдо)
```
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authStore.token;
  const res = await fetch(BASE_URL + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`[${res.status}] ${err.message || res.statusText}`);
  }
  return res.json();
}
```

---
Эти типы следует актуализировать при каждом изменении DTO / схем. Добавляйте запись в CHANGELOG (раздел 17).

## 20. Реальные запросы и ответы (каноничные примеры для фронтенда)

Ниже приведены реальные (снятые со структур контроллеров) примеры запросов и ответов. Используйте их для автогенерации интерфейсов и моков. Поля могут расширяться — проверяйте CHANGELOG.

### 20.1 Subscription Plans

GET /subscription-plans?page=1&limit=2
Ответ:
```
{
  "plans": [
    {
      "id": "664fd1a9e6c0f7c1c9a1a111",
      "name": "Premium 3 months",
      "slug": "premium-3-months",
      "description": "Расширенный доступ на 3 месяца",
      "period_type": "3_months",
      "price": 1500,
      "currency": "UAH",
      "discount_percent": 10,
      "original_price": 1800,
      "is_active": true,
      "is_popular": true,
      "is_featured": false,
      "features": ["Все курсы", "Приоритетная поддержка"],
      "benefits": ["Экономия 300 UAH"],
      "color": "#FF6B6B",
      "icon": "star",
      "sort_order": 10,
      "subscribers_count": 42,
      "total_revenue": 63000,
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-09-04T09:00:00.000Z"
    }
  ],
  "pagination": { "currentPage": 1, "totalPages": 1, "totalItems": 1, "itemsPerPage": 2 }
}
```

POST /subscription-plans (admin)
```
{
  "name": "Standard 1 month",
  "slug": "standard-1-month",
  "description": "Базовый доступ на месяц",
  "period_type": "1_month",
  "price": 500,
  "currency": "UAH",
  "features": ["Ограниченный доступ"],
  "benefits": []
}
```
Ответ 201:
```
{ "message": "Тарифный план успешно создан", "plan": { "id": "...", "name": "Standard 1 month", ... } }
```

### 20.2 Subscriptions (подписки)

POST /subscriptions
```
{
  "userId": "6650aa...",   // если разрешено админом; иначе берется из JWT
  "course": "6650bc...",   // ID курса
  "price": 1500,
  "paidAmount": 0,
  "subscription_type": "monthly",
  "start_date": null,
  "end_date": null,
  "auto_renewal": false
}
```
Ответ 201:
```
{
  "message": "Подписка успешно создана",
  "subscription": {
     "id": "6650cc...",
     "user": "6650aa...",
     "course": "6650bc...",
     "status": "pending",
     "price": 1500,
     "paidAmount": 0,
     "subscription_type": "monthly",
     "start_date": null,
     "end_date": null,
     "auto_renewal": false,
     "enrolledBy": "self",
     "enrolledAt": "2025-09-04T11:10:00.000Z",
     "createdAt": "2025-09-04T11:10:00.000Z",
     "updatedAt": "2025-09-04T11:10:00.000Z"
  }
}
```

GET /subscriptions?page=1&limit=10&status=active
```
{
  "subscriptions": [ { "id": "6650cc...", "status": "active", "course": "6650bc...", "price": 1500, "paidAmount": 1500 } ],
  "pagination": { "currentPage":1, "totalPages":1, "totalItems":1, "itemsPerPage":10 },
  "filters": { "status": "active" }
}
```

GET /subscriptions/:id
```
{ "subscription": { "id": "6650cc...", "status": "active", "course": "6650bc...", "price": 1500, "paidAmount": 1500 } }
```

POST /subscriptions/:id/cancel
```
{ "reason": "Не нужен", "immediate": true }
```
Ответ:
```
{ "message": "Подписка немедленно отменена", "subscription": { "id": "...", "status": "cancelled", "cancellation_reason": "Не нужен", "cancelled_at": "2025-09-04T11:30:00.000Z" } }
```

POST /subscriptions/:id/renew
```
{ "period": "1_month", "auto_renewal": true }
```
Ответ:
```
{ "message": "Подписка успешно продлена", "subscription": { "id": "...", "status": "active", "next_billing_date": "2025-10-04T11:10:00.000Z" } }
```

POST /subscriptions/:id/pay
```
{ "currency": "UAH", "redirectUrl": "https://app.example.com/pay/return" }
```
Ответ 201:
```
{
  "message": "Платеж создан. Перейдите по ссылке для оплаты.",
  "paymentId": "pay_abc123",
  "pageUrl": "https://pay.monobank.ua/....",
  "amount": 1500,
  "currency": "UAH",
  "subscription": { "id": "6650cc...", "type": "monthly", "startDate": null, "endDate": null }
}
```

GET /subscriptions/user/:userId
```
{ "userId": "6650aa...", "subscriptions": [ ... ], "totalSubscriptions": 3 }
```

GET /subscriptions/course/:courseId?page=1&limit=20
```
{
  "courseId": "6650bc...",
  "subscriptions": [ { "id": "..", "status": "active", "user": "6650aa..." } ],
  "pagination": { "currentPage":1, "totalPages":1, "totalItems":1, "itemsPerPage":20 }
}
```

### 20.3 Homework (домашние задания)

POST /homework (multipart form)
Поля form-data:
- files[]: (до 5) PDF/ZIP/DOCX
- title: "HW #1"
- courseId: "6650bc..."
- description: "Сделать упражнение"

Успешный ответ:
```
{
  "success": true,
  "message": "Домашнее задание успешно создано",
  "data": {
     "id": "hw_1",
     "title": "HW #1",
     "course": "6650bc...",
     "teacher": "6650aa...",
     "files": [ { "filename": "homework-1725449000.pdf", "size": 23456 } ],
     "createdAt": "2025-09-04T11:20:00.000Z"
  }
}
```

GET /homework/student/my?courseId=6650bc...
```
{ "success": true, "data": [ { "id": "hw_1", "title": "HW #1", "status": "assigned" } ] }
```

POST /homework/:id/submit (multipart)
Поля form-data:
- files[] (до 10) ZIP/PDF/IMG
Ответ:
```
{
  "success": true,
  "message": "Домашнее задание успешно отправлено",
  "data": { "id": "subm_1", "homework": "hw_1", "student": "6650aa...", "files": [ ... ], "submittedAt": "2025-09-04T11:35:00.000Z" }
}
```

PUT /homework/submissions/:id/review
```
{ "grade": 90, "comment": "Отлично" }
```
Ответ:
```
{ "success": true, "message": "Домашнее задание успешно проверено", "data": { "id": "subm_1", "grade": 90, "reviewedAt": "2025-09-04T11:50:00.000Z" } }
```

GET /homework/:id
```
{ "success": true, "data": { "id": "hw_1", "title": "HW #1", "files": [ ... ], "teacher": "6650aa..." } }
```

### 20.4 Attendance (посещаемость урока)

POST /lessons/:id/attendance
```
{
  "attendanceData": [
     { "studentId": "stud1", "isPresent": true, "lessonGrade": 95 },
     { "studentId": "stud2", "isPresent": false, "lessonGrade": null, "notes": "Отсутствие по болезни" }
  ]
}
```
Ответ:
```
{
  "success": true,
  "message": "Посещаемость успешно отмечена",
  "data": [
     { "student": "stud1", "isPresent": true, "lessonGrade": 95, "markedAt": "2025-09-04T12:00:00.000Z" },
     { "student": "stud2", "isPresent": false, "lessonGrade": null, "notes": "Отсутствие по болезни", "markedAt": "2025-09-04T12:00:00.000Z" }
  ]
}
```

GET /lessons/:id/attendance
```
{
  "success": true,
  "data": {
     "lesson": { "id": "les_1", "title": "Intro", "date": "2025-09-04T10:00:00.000Z", "startTime": "10:00", "endTime": "11:00" },
     "attendance": [ { "student": "stud1", "isPresent": true, "lessonGrade": 95 }, { "student": "stud2", "isPresent": false } ]
  }
}
```

### 20.5 Денежные поля (нормализация)

Исторически часть эндпоинтов (courses, subscription-plans) принимает цену в человеческих единицах (гривны), а платежи Monobank возвращают minor units (копейки). РЕКОМЕНДАЦИЯ К ФРОНТУ:
1. Для форм ввода: работать в human (целые UAH) → отправлять как есть.
2. Для отображения платежей: если поле amount > 10000 и статус из payments — делить на 100 при показе.
3. Добавить утилиту: `formatMoney(value: number, source: 'human' | 'minor')`.
4. (Будущее) В CHANGELOG появится миграция на единый формат minor units.

### 20.6 Унификация успеха

Части контроллеров возвращают ключ `success: true`. Там где его нет (например, списки планов / подписок) — не добавляйте его искусственно на фронте, просто нормализуйте к своему локальному типу.

### 20.7 Сопоставление статусов (Subscriptions vs Payments)
| Domain | Статус | UI Badge |
|--------|--------|----------|
| Subscription | pending | "Ожидает оплаты" (warning) |
| Subscription | active | "Активна" (success) |
| Subscription | cancelled | "Отменена" (neutral) |
| Subscription | expired | "Истекла" (secondary) |
| Subscription | completed | "Завершена" (info) |
| Payment | processing | "Обрабатывается" (warning) |
| Payment | success | "Оплачен" (success) |
| Payment | failure | "Ошибка" (danger) |
| Payment | expired | "Просрочен" (secondary) |

### 20.8 Типовые ошибки (реальные payloads)
```
// Валидация DTO
{
  "statusCode": 400,
  "message": ["price must not be less than 0"],
  "error": "Bad Request"
}

// Не найден ресурс
{ "statusCode": 404, "message": "Подписка не найдена", "error": "Not Found" }

// Конфликт операции
{ "statusCode": 409, "message": "Подписка уже отменена", "error": "Conflict" }
```

### 20.9 Генерация TS типов из этого раздела
Алгоритм:
1. Найти все блоки кода в разделе 20.
2. Конвертировать JSON примеры в интерфейсы (ключи + типы по значениям, null → union).
3. Объединить поля из разных примеров одного ресурса (Subscription, Payment) в единый интерфейс.
4. Сравнить с разделом 19 — при расхождении предпочесть раздел 19 (канон) и создать CHANGELOG item.

### 20.10 План расширения
Добавить позже (если появится запрос):
- Реальные примеры: статистика подписок, статистика планов
- Примеры отклика seed/recreate планов
- Пример auto_renewal цикла (cron/Webhook)

## 21. Полный каталог примеров по всем эндпоинтам

Формат:
```
ENDPOINT METHOD
Request (если есть)
Response (успешный)
Ошибки (типовые)
```
JSON сокращён (… где опущены поля). Используйте как основу для генерации типов.

### 21.1 Auth

POST /auth/register/send-code
Request:
```
{ "email": "user@example.com" }
```
Response:
```
{ "message": "Код отправлен" }
```
Ошибки: 400 (invalid email), 409 (already exists)

POST /auth/register/verify-code
```
{ "email":"user@example.com","code":"123456","login":"user1","password":"Passw0rd!" }
```
Response:
```
{ "access_token": "<JWT>", "user": { "id": "...", "email": "user@example.com", "login": "user1", "roles": [] } }
```

POST /auth/login
```
{ "login": "user1", "password": "Passw0rd!" }
```
Response = как выше.

POST /auth/forgot-password
```
{ "email": "user@example.com" }
```
Response: { "message": "Код отправлен" }

POST /auth/reset-password
```
{ "email":"user@example.com","code":"123456","newPassword":"NewPassw0rd!" }
```
Response: { "message": "Пароль обновлён" }

GET /auth/google/status (JWT)
Response:
```
{ "isLinked": true, "googleId":"...", "lastGoogleLogin": "2025-09-04T11:10:00.000Z", "hasValidToken": true }
```

### 21.2 Users

GET /users/:id
Response:
```
{ "id":"...","email":"user@example.com","login":"user1","roles":["user"],"isBlocked":false,"createdAt":"..." }
```

PUT /users/:id
Request:
```
{ "login": "newLogin", "bio": null }
```
Response:
```
{ "message": "Профиль успешно обновлен", "user": { "id":"...","login":"newLogin" } }
```

PATCH /users/:id/block
```
{ "isBlocked": true }
```
Response: { "message": "Пользователь успешно заблокирован", "user": { "id":"...","isBlocked":true } }

DELETE /users/:id → { "message": "Пользователь успешно удален" }

POST /users/:userId/roles/:roleId → { "userId":"...","roleId":"...","added":true }
DELETE /users/:userId/roles/:roleId → { "userId":"...","roleId":"...","removed":true }

GET /users (admin)
```
[{ "id":"...","email":"...","roles":["admin"] }]
```

### 21.3 Roles
(Если активируете CRUD — придерживайтесь паттерна)
POST /roles { "name": "manager" } → { "message":"Роль создана","role":{...} }
GET /roles → { "roles": [ {"id":"...","name":"admin"} ] }

### 21.4 Categories

POST /categories (admin)
```
{ "name":"Programming","slug":"programming","description":"..." }
```
Response: { "message":"Категория успешно создана","category":{ "id":"...","name":"Programming" } }

GET /categories
```
{ "categories": [ {"id":"...","name":"Programming"} ], "total": 1 }
```

GET /categories/:id → { "category": { "id":"...","name":"Programming" } }
PUT /categories/:id { "name":"Dev" } → { "message":"Категория успешно обновлена","category":{...} }
DELETE /categories/:id → { "message":"Категория успешно удалена" }
GET /categories/tree → { "categories": [ { "id":"root","children":[...] } ] }
GET /categories/featured?limit=6 → { "categories":[...], "total":6 }

### 21.5 Difficulty Levels
POST /difficulty-levels { "name":"Начальный","code":"beginner","order":1 }
→ { "message":"Уровень сложности успешно создан","level":{ "id":"...","code":"beginner" } }
GET /difficulty-levels → { "levels":[{ "id":"...","code":"beginner" }], "total":1 }
GET /difficulty-levels/:id → { "level": { ... } }
PUT /difficulty-levels/:id { "name":"Старт" } → { "message":"Уровень сложности успешно обновлен","level":{...} }
DELETE /difficulty-levels/:id → { "message":"Уровень сложности успешно удален" }
GET /difficulty-levels/:id/courses?page=1&limit=12
```
{
  "difficultyLevel": { "id":"...","code":"beginner","name":"Начальный" },
  "courses": [ { "id":"c1","title":"JS 101" } ],
  "pagination": { "currentPage":1,"totalPages":1,"totalItems":1,"itemsPerPage":12 }
}
```

### 21.6 Subjects
POST /subjects (admin)
```
{ "name":"JavaScript","description":"Основы" }
```
Response: { "id":"...","name":"JavaScript" }
GET /subjects → [ { "id":"...","name":"JavaScript" } ]
GET /subjects/:id → { "id":"...","name":"JavaScript","studyMaterials":[...] }
PUT /subjects/:id { "description":null } → { "id":"...","description":null }
DELETE /subjects/:id → { "deleted": true }
POST /subjects/:id/materials (multipart) fields: type,title,(file/url)
Response: { "id":"mat1","type":"pdf","title":"Лекция 1" }
GET /subjects/:id/materials → [ { "id":"mat1","type":"pdf" } ]
DELETE /subjects/:sid/materials/:mid → { "removed": true }

### 21.7 Courses
POST /courses
```
{ "title":"Frontend Base","description":"...","mainTeacherId":"t1","price":1200 }
```
Response: { "message":"Курс успешно создан","course": { "id":"...","title":"Frontend Base","published":false } }

GET /courses?page=1&limit=10&search=front
```
{
  "courses":[{"id":"...","title":"Frontend Base"}],
  "pagination":{"currentPage":1,"totalPages":1,"totalItems":1,"itemsPerPage":10},
  "filters":{"search":"front","isPublished":true,"isActive":true}
}
```
GET /courses/:id → { "course": { "id":"...","title":"Frontend Base","courseSubjects":[...] } }
PUT /courses/:id { "title":"Frontend Advanced" } → { "message":"Курс успешно обновлен","course":{...} }
DELETE /courses/:id → { "message":"Курс успешно удален" }

Шаги предметов:
1) POST /courses/:id/subjects { "subjectId":"sub1" } → { "success":true,"course":{...} }
2) PUT /courses/:id/subjects/:subjectId/teacher { "teacherId":"t1" } → { "success":true,"course":{...} }
3) PUT /courses/:id/subjects/:subjectId/start-date { "startDate":"2025-09-10T09:00:00.000Z" } → { "success":true,"course":{...} }

Enrollment:
POST /courses/:id/enroll { "paymentId":"pay1" } → { "message":"Запись успешна","course":{...} }
POST /courses/:id/admin-enroll { "userId":"u1" } → { "message":"Пользователь записан администратором" }
PUT /courses/:id/start-date { "startDate":"2025-09-15T10:00:00.000Z" } → { "message":"Дата начала курса обновлена","course":{...} }
GET /courses/:id/lessons → { "lessons":[{"id":"l1","title":"Intro"}], "total":1 }
GET /courses/:id/statistics → { "courseId":"...","students":10,"completed":2 }
GET /courses/:id/students → { "courseId":"...","students":[{"id":"u1"}], "total":1 }

### 21.8 Lessons (основные операции)
POST /lessons
```
{ "courseId":"c1","subjectId":"sub1","title":"Intro","date":"2025-09-05T10:00:00.000Z" }
```
Response: { "message":"Урок создан","lesson": { "id":"l1","title":"Intro" } }
GET /lessons/:id → { "lesson": { "id":"l1","title":"Intro","date":"..." } }
PUT /lessons/:id { "title":"Intro Updated" } → { "message":"Урок обновлен","lesson":{...} }
DELETE /lessons/:id → { "message":"Урок удален" }
PUT /lessons/:id/schedule { "date":"2025-09-06T10:00:00.000Z","startTime":"10:00","endTime":"11:00" } → { "message":"Расписание обновлено","lesson":{...} }

### 21.9 Attendance (уже частично в 20.4)
См. 20.4 для подробных примеров.

### 21.10 Homework (дополнение)
GET /homework/teacher/submissions?status=pending → { "success":true, "data":[{"id":"subm_1","homework":"hw_1","student":"u1"}] }
GET /homework/:id/statistics → { "success":true, "data": { "homeworkId":"hw_1","submitted":8,"graded":5,"avgGrade":87 } }

### 21.11 Payments
POST /payments/create
```
{ "subscriptionId":"subscr1","amount":1500,"currency":"UAH","description":"Подписка","redirectUrl":"https://app/after-pay" }
```
Response:
```
{ "message":"Платеж создан успешно","payment": { "id":"p1","status":"created","invoiceId":"inv1","amount":1500 }, "pageUrl":"https://pay.monobank.ua/..." }
```
GET /payments/:id → { "payment": { "id":"p1","status":"success" }, "statusDescription":"Оплачен" }
GET /payments/subscription/:subscriptionId → { "subscriptionId":"subscr1","payments":[{ "id":"p1" }], "totalPayments":1 }
GET /payments/user/:userId?page=1&limit=10 → { "userId":"u1","payments":[...], "pagination":{...} }
PUT /payments/:id/cancel → { "message":"Платеж отменен","payment":{ "id":"p1","status":"canceled" } }
POST /payments/:invoiceId/sync → { "message":"Статус платежа синхронизирован","payment": { "id":"p1","status":"success","statusDescription":"Оплачен" } }
POST /payments/webhook (Monobank) Body:
```
{ "invoiceId":"inv1","status":"success","amount":150000,"ccy":980 }
```
Response: { "status":"ok" }

### 21.12 Subscription Plans (дополнение)
GET /subscription-plans/featured → { "plans":[{"id":"pplan1"}], "totalPlans":1 }
GET /subscription-plans/popular → аналогично.
PUT /subscription-plans/:id { "price":2000 } → { "message":"Тарифный план успешно обновлен","plan":{ "id":"...","price":2000 } }
PUT /subscription-plans/:id/activate { "is_active": false } → { "message":"Тарифный план деактивирован","plan":{...} }
DELETE /subscription-plans/:id?force=false → { "message":"Тарифный план деактивирован","deleted":false }
POST /subscription-plans/seed → { "message":"Базовые тарифные планы созданы успешно","plans":[...], "totalCreated":3 }
POST /subscription-plans/recreate → { "message":"Базовые тарифные планы пересозданы успешно","plans":[...], "totalCreated":3 }
GET /subscription-plans/statistics/overview → { "statistics": { "totalPlans":5,"activePlans":4,"totalRevenue":123000 } }

### 21.13 Subscriptions (дополнено к 20.2)
GET /subscriptions/statistics/overview → { "statistics": { "active":12,"pending":3,"cancelled":2,"revenue":45000 } }
POST /subscriptions/expire-check → { "message":"Проверка истекающих подписок завершена","expiredCount":1,"notifiedCount":1 }
POST /subscriptions/enroll { "courseId":"c1","paidAmount":1200 } → { "id":"subEnroll1","status":"pending" }
POST /subscriptions/admin-enroll { "courseId":"c1","userId":"u2","paidAmount":1200 } → { "id":"subEnroll2","status":"active" }
PUT /subscriptions/:id/status { "status":"active" } → { "id":"...","status":"active" }

### 21.14 Teachers
POST /teachers → { "message":"Заявка на регистрацию преподавателя успешно подана...","teacher": { "id":"t1","status":"pending" } }
GET /teachers?status=approved&page=1&limit=10 → { "teachers":[{"id":"t2","status":"approved"}], "pagination":{...} }
GET /teachers/:id → { "teacher": { "id":"t2","status":"approved" } }
PUT /teachers/:id { "bio":"Опыт 10 лет" } → { "message":"Данные преподавателя успешно обновлены","teacher":{...} }
POST /teachers/:id/approve { "approvalStatus":"approved" } → { "message":"Заявка преподавателя одобрена","teacher":{...} }
POST /teachers/:teacherId/courses/:courseId → { "message":"Курс успешно назначен преподавателю","teacher":{...} }
DELETE /teachers/:teacherId/courses/:courseId → { "message":"Курс успешно удален у преподавателя","teacher":{...} }
POST /teachers/:id/block { "isBlocked":true,"reason":"Нарушение" } → { "message":"Преподаватель успешно заблокирован","teacher":{...} }
GET /teachers/pending/applications → { "applications":[{"id":"t1"}], "pagination":{...} }
GET /teachers/:id/statistics → { "teacherId":"t2","statistics": { "courses":5,"students":120 } }
GET /teachers/:id/courses → { "teacherId":"t2","courses":[{"id":"c1"}], "totalCourses":1 }
DELETE /teachers/:id → { "message":"Преподаватель успешно удален" }

### 21.15 Avatars
GET /avatars/:userId → { "success":true, "avatar": { "id":"av1","userId":"u1","imageData":"<base64>","mimeType":"image/png" } }
POST /avatars/upload/:userId (multipart field avatar)
Response:
```
{ "success":true, "message":"Аватар успешно загружен", "avatar": { "id":"av1","size":523421,"width":1024,"height":1024 } }
```
PUT /avatars/replace/:userId (если реализовано) → { "success":true, "avatar":{...} }
DELETE /avatars/:userId → { "success":true, "message":"Аватар удален" }

### 21.16 Legacy / Deprecated
Course Subjects controller (/course-subjects*) — DEPRECATED. Не использовать; вся логика перенесена в /courses/:id/subjects.* шаги.

### 21.17 Типовые ошибки по ресурсам (сводно)
| Resource | Код | message |
|----------|-----|---------|
| courses | 404 | "Курс не найден" |
| courses | 403 | "У вас нет прав на редактирование этого курса" |
| subscriptions | 409 | "Подписка уже отменена" |
| payment | 400 | "Invalid signature" |
| homework | 400 | "Необходимо прикрепить хотя бы один файл с решением" |
| avatars | 400 | "Файл не соответствует требованиям: ..." |
| teachers | 409 | "Курс уже назначен этому преподавателю" |
| categories | 409 | "Категория с таким slug уже существует" |
| difficulty-levels | 409 | "Уровень с таким кодом уже существует" |

### 21.18 Контроль консистентности фронта
Проверочный чеклист интеграции:
1. Все запросы -> prefix /api.
2. JWT всегда в Authorization Bearer.
3. При logout чистить localStorage токена и кэши профиля.
4. Отлавливать 401 -> redirect /login; 403 -> скрывать действие.
5. Поля nullable отправлять ровно null (без пропуска, если нужно очистить значение).
6. При получении списков делать defensive parsing (если backend вернёт [] без pagination).
7. Денежные поля: применять util formatMoney (см. 20.5).
8. Генерация TS интерфейсов: слияние разделов 19 + 20 + 21 (при конфликте — раздел 19).


## 20. Минимальный пакет спецификаций (для строгой типизации фронтенда)

### 20.1 Базовые параметры
| Параметр | Значение (пример) | Комментарий |
|----------|-------------------|-------------|
| BASE_URL | https://neuronest.pp.ua/api | В `main.ts` глобальный префикс `api` → включён в BASE_URL |
| Локально | http://localhost:8000/api | Порт из env/config (fallback 8000) |
| Префикс путей (fetch) | без дополнительного `/api` | НЕ делайте `.../api/api/...` |
| Версионирование | (пока нет) | При вводе v1 → станет `/api/v1/...` (зарезервировать поле) |
| Swagger | https://neuronest.pp.ua/api/docs | Документация / тест |

### 20.2 Авторизация
| Аспект | Спецификация |
|--------|--------------|
| Хранение токена | localStorage key: `auth_token` (один источник истины) |
| Заголовок | `Authorization: Bearer <JWT>` |
| Refresh токен | НЕ реализован (нет эндпоинта обновления) |
| Logout | Клиент: удалить `auth_token` |
| Истечение | По истечении — 401 от бэка, фронт удаляет токен и редиректит на /login |

### 20.3 CORS / Proxy
| Поле | Значение |
|------|----------|
| CORS | origin: true (разрешено всё) |
| credentials | true (можно, но cookies не обязательны) |
| Vite proxy | Можно не использовать, прямые абсолютные URL допустимы |
| Cookies | Не требуются для авторизации (только Header) |

### 20.4 Формат ответов по ресурсам
Общее: коллекции возвращаются как объект с именованным массивом + счётчики.

#### Categories (GET /categories)
```
{
  "categories": [
    {
      "id": "6730c1c2f1d2a3b456789012",
      "name": "Programming",
      "slug": "programming",
      "description": "Полное описание",
      "short_description": "Коротко",
      "icon": "code",
      "image_url": null,
      "color": "#3f51b5",
      "parent_id": null,
      "isActive": true,
      "isFeatured": false,
      "order": 0,
      "meta_title": null,
      "meta_description": null,
      "meta_keywords": [],
      "courses_count": 12,
      "students_count": 340,
      "createdAt": "2025-09-04T11:20:33.000Z",
      "updatedAt": "2025-09-04T11:20:33.000Z"
    }
  ],
  "total": 1
}
```

#### Difficulty Levels (GET /difficulty-levels)
```
{
  "levels": [
    {
      "id": "6730c2d9f1d2a3b456789013",
      "name": "Beginner",
      "slug": "beginner",
      "code": "beginner",
      "level": 1,
      "color": "#4caf50",
      "description": "Для начинающих",
      "isActive": true,
      "createdAt": "2025-09-04T11:22:10.000Z",
      "updatedAt": "2025-09-04T11:22:10.000Z"
    }
  ],
  "total": 1
}
```

#### Subjects (GET /subjects)
Возвращает массив напрямую (controller возвращает `this.subjectsService.findAll()`):
```
[
  {
    "id": "6730c311f1d2a3b456789014",
    "name": "JavaScript",
    "description": "Основы JS",
    "studyMaterials": [
      { "id": "m1", "type": "video", "title": "Intro", "url": "https://..." }
    ],
    "createdAt": "2025-09-04T11:23:41.000Z",
    "updatedAt": "2025-09-04T11:23:41.000Z"
  }
]
```

#### Courses (GET /courses?page=1&limit=5)
```
{
  "courses": [
    {
      "id": "6730c3aaf1d2a3b456789015",
      "title": "Fullstack Web",
      "description": "Полный курс",
      "categoryId": "6730c1c2f1d2a3b456789012",
      "difficultyLevelId": "6730c2d9f1d2a3b456789013",
      "price": 1500,
      "isPublished": true,
      "isFeatured": false,
      "isActive": true,
      "courseSubjects": [
        { "subjectId": "6730c311f1d2a3b456789014", "teacherId": null, "startDate": null }
      ],
      "studentsCount": 42,
      "startDate": "2025-10-01T09:00:00.000Z",
      "createdAt": "2025-09-04T11:25:55.000Z",
      "updatedAt": "2025-09-04T11:25:55.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 50,
    "itemsPerPage": 5
  },
  "filters": { "isPublished": true, "isActive": true }
}
```

#### Teachers (GET /teachers)
(Если контроллер возвращает список — предположительная структура курса преподавателя.)
```
{
  "teachers": [
    {
      "id": "6730c44df1d2a3b456789016",
      "userId": "672ffc11f1d2a3b456789000",
      "fullName": "Иван Петров",
      "headline": "Senior Developer",
      "bio": "10 лет в индустрии",
      "subjects": ["JavaScript", "Node.js"],
      "rating": 4.9,
      "coursesCount": 5,
      "studentsCount": 320,
      "createdAt": "2025-09-04T11:27:30.000Z",
      "updatedAt": "2025-09-04T11:27:30.000Z"
    }
  ],
  "total": 1
}
```

### 20.5 Поля идентификаторов
| Ресурс | Поле ID в JSON | Примечание |
|--------|----------------|-----------|
| Все схемы (через transform) | id | `_id` удалён при toJSON |
| Связи (courseSubjects.subjectId) | subjectId | ObjectId в строке |

### 20.6 Пагинация
| Query | Тип | Default | Комментарий |
|-------|-----|---------|-------------|
| page | number | 1 | >=1 |
| limit | number | 10 (курсы), 12 (категории/уровни карточки) | Ограничивать фронтом до 100 |

Ответ с пагинацией (курсы/категории/уровни):
```
{
  "<collection>": [...],
  "pagination": { currentPage, totalPages, totalItems, itemsPerPage }
}
```
Категории/уровни базовые списки вместо `pagination` сейчас возвращают `total`; при вводе пагинации — выровнять.

### 20.7 Формат ошибок (уточнение)
| Код | JSON пример | Клиентское действие |
|-----|-------------|---------------------|
| 401 | {"statusCode":401,"message":"Unauthorized","error":"Unauthorized"} | Очистить токен / редирект |
| 403 | {"statusCode":403,"message":"Недостаточно прав","error":"Forbidden"} | Скрыть UI, показать уведомление |
| 404 | {"statusCode":404,"message":"Курс не найден","error":"Not Found"} | Показать "не найдено" |
| 409 | {"statusCode":409,"message":"Предмет уже присутствует в курсе","error":"Conflict"} | Информировать, не повторять |
| 400 | {"statusCode":400,"message":["startDate must be ISO date"],"error":"Bad Request"} | Подсветить поля |

### 20.8 CRUD ограничения (editable fields)
| Ресурс | Поля для обновления | Ограничения |
|--------|---------------------|-------------|
| User (self) | email? (через отдельный flow), login?, password(change endpoint) | Роли нельзя менять самому |
| User (admin) | roles, locked, teacherFlags | Email изменение через подтверждение |
| Course | title, description, categoryId, difficultyLevelId, startDate, maxStudents, price, isPublished (admin/owner), isFeatured (admin) | teacher только свои курсы |
| Category | name, slug, description, short_description, color, icon, image_url, parent_id, order, isActive, isFeatured, meta_* | slug уникален |
| DifficultyLevel | name, slug, code, level, color, description, isActive | code уникален |
| Subject | name, description | Материалы отдельными эндпоинтами |
| SubscriptionPlan | name, description, periodDays, priceMinorUnits, features[], isActive, isFeatured | Денежные поля в minor units (копейки) |
| Payment (cancel) | status -> canceled | Только если не success/failure/expired |

### 20.9 Денежные значения
| Поле | Формат | Хранение |
|------|--------|----------|
| price (Course) | number (грн, human) | (уточнить: если перейдёте на minor units — обновить) |
| amount (Payment) | number (minor) | Делить на 100 для отображения |
| priceMinorUnits (SubscriptionPlan) | number (minor) | Показывать /100 |

### 20.10 Даты / зона
| Аспект | Значение |
|--------|---------|
| Формат | ISO 8601 строка |
| Таймзона | UTC (Date.toISOString()) |
| Ввод клиента | Всегда локальную дату конвертировать в UTC перед отправкой |

### 20.11 Дополнительно
| Параметр | Нужно? | Примечание |
|----------|--------|------------|
| Accept-Language | Нет (опционально) | Можно добавить для локализации позже |
| Swagger/OpenAPI | Да | `/api/docs` |
| Rate-Limit headers | Нет | Не реализовано |

### 20.12 Рекомендации по типам фронта
1. Генерировать TS интерфейсы из разделов 19 и 20.
2. Единый тип `ApiError = { statusCode:number; message:string | string[]; error:string }`.
3. Для списков: дженерик `Paginated<T> = { pagination: {...}; } & Record<CollectionKey, T[]>`.
4. Внедрить тип-гард: если свойство `pagination` существует → это пагинированный ответ.

### 20.13 Пример строгой типизации (фронт)
```
interface CourseListResponse extends Paginated<Course> {
  courses: Course[];
  filters: Record<string, any>;
}

function isApiError(x: any): x is ApiError {
  return x && typeof x.statusCode === 'number' && typeof x.error === 'string';
}
```

---
Этот раздел + (19) дают фронтенду полную основу для отказа от временных нормализаций.

### 20.14 Реальные примеры (собраны по текущему коду контроллеров)

Ниже — точные структуры, возвращаемые текущими методами (без искусственных полей).

1) GET /categories (контроллер возвращает { categories, total })
```
{
  "categories": [
    {
      "id": "64fa0c1c2f1d2a3b45678901",
      "name": "Programming",
      "slug": "programming",
      "description": "Описание",
      "short_description": null,
      "icon": null,
      "image_url": null,
      "color": "#3f51b5",
      "parent_id": null,
      "isActive": true,
      "isFeatured": false,
      "order": 0,
      "meta_title": null,
      "meta_description": null,
      "meta_keywords": [],
      "courses_count": 0,
      "students_count": 0,
      "createdAt": "2025-09-04T10:11:22.000Z",
      "updatedAt": "2025-09-04T10:11:22.000Z"
    }
  ],
  "total": 1
}
```

2) GET /difficulty-levels (возврат { levels, total })
```
{
  "levels": [
    {
      "id": "64fa0d2d2f1d2a3b45678902",
      "name": "Beginner",
      "slug": "beginner",
      "code": "beginner",
      "level": 1,
      "color": "#4caf50",
      "description": "Для начинающих",
      "isActive": true,
      "createdAt": "2025-09-04T10:12:30.000Z",
      "updatedAt": "2025-09-04T10:12:30.000Z"
    }
  ],
  "total": 1
}
```

3) GET /subjects (возвращается массив напрямую)
```
[
  {
    "id": "64fa0e11f1d2a3b45678903",
    "name": "JavaScript",
    "description": "Основы JS",
    "studyMaterials": [
      { "id": "a1", "type": "video", "title": "Intro", "url": "https://..." }
    ],
    "createdAt": "2025-09-04T10:13:44.000Z",
    "updatedAt": "2025-09-04T10:13:44.000Z"
  }
]
```

4) GET /courses (возврат { courses, pagination, filters })
```
{
  "courses": [
    {
      "id": "64fa0eef2f1d2a3b45678904",
      "title": "Fullstack Web",
      "description": "Полный курс",
      "categoryId": "64fa0c1c2f1d2a3b45678901",
      "difficultyLevelId": "64fa0d2d2f1d2a3b45678902",
      "price": 1500,
      "isPublished": true,
      "isFeatured": false,
      "isActive": true,
      "courseSubjects": [
        { "subjectId": "64fa0e11f1d2a3b45678903", "teacherId": null, "startDate": null }
      ],
      "studentsCount": 10,
      "startDate": "2025-10-01T09:00:00.000Z",
      "createdAt": "2025-09-04T10:14:55.000Z",
      "updatedAt": "2025-09-04T10:14:55.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  },
  "filters": { "isPublished": true, "isActive": true }
}
```

5) GET /teachers (возврат { teachers, pagination })
```
{
  "teachers": [
    {
      "id": "64fa0f88f1d2a3b45678905",
      "userId": "64fa0b55f1d2a3b45678900",
      "fullName": "Иван Петров",
      "headline": "Senior Developer",
      "bio": "10 лет в индустрии",
      "subjects": ["JavaScript", "Node.js"],
      "rating": 4.9,
      "coursesCount": 5,
      "studentsCount": 320,
      "createdAt": "2025-09-04T10:15:05.000Z",
      "updatedAt": "2025-09-04T10:15:05.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

6) GET /teachers/pending/applications (возврат { applications, pagination })
```
{
  "applications": [
    {
      "id": "64fa1012f1d2a3b45678906",
      "email": "pending@example.com",
      "approvalStatus": "pending",
      "createdAt": "2025-09-04T10:16:10.000Z",
      "updatedAt": "2025-09-04T10:16:10.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

7) GET /categories/:id/courses (карточки категории)
```
{
  "category": {
    "id": "64fa0c1c2f1d2a3b45678901",
    "name": "Programming",
    "slug": "programming",
    "description": "Описание"
  },
  "courses": [
    { "id": "64fa0eef2f1d2a3b45678904", "title": "Fullstack Web", "isPublished": true, "price": 1500 }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 12
  }
}
```

8) GET /difficulty-levels/:id/courses (карточки уровня)
```
{
  "difficultyLevel": {
    "id": "64fa0d2d2f1d2a3b45678902",
    "name": "Beginner",
    "slug": "beginner",
    "code": "beginner",
    "level": 1,
    "color": "#4caf50",
    "description": "Для начинающих"
  },
  "courses": [
    { "id": "64fa0eef2f1d2a3b45678904", "title": "Fullstack Web", "isPublished": true, "price": 1500 }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 12
  }
}
```

9) GET /teachers/:id/courses (полный список курсов преподавателя)
```
{
  "teacherId": "64fa0f88f1d2a3b45678905",
  "courses": [
    {
      "id": "64fa0eef2f1d2a3b45678904",
      "title": "Fullstack Web",
      "isPublished": true,
      "isActive": true,
      "price": 1500,
      "createdAt": "2025-09-04T10:14:55.000Z",
      "updatedAt": "2025-09-04T10:14:55.000Z"
    }
  ],
  "totalCourses": 1,
  "publishedCourses": 1,
  "activeCourses": 1
}
```

10) GET /payments/:id (формат после контроллера)
```
{
  "payment": {
    "id": "64fa1099f1d2a3b45678907",
    "invoiceId": "inv_123",
    "status": "processing",
    "amount": 150000,
    "currency": "UAH",
    "subscriptionId": "64fa110af1d2a3b45678908",
    "description": "Подписка STANDARD",
    "createdAt": "2025-09-04T10:17:30.000Z",
    "updatedAt": "2025-09-04T10:17:30.000Z"
  },
  "statusDescription": "Обрабатывается"
}
```

11) Ошибка валидации (пример POST /courses с некорректным полем)
```
{
  "statusCode": 400,
  "message": [
    "title must be a string"
  ],
  "error": "Bad Request"
}
```

12) Конфликт (добавление уже существующего subject в курс)
```
{
  "statusCode": 409,
  "message": "Предмет уже присутствует в курсе",
  "error": "Conflict"
}
```

Примечание: Значения ID / даты примерные; фронт НЕ должен полагаться на порядок полей, только на имена.
