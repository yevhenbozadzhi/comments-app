# План разработки: SPA «Комментарии» (Express.js)

Пошаговый план от нуля до сдачи.

**Стек:**
| Слой | Выбор |
|------|--------|
| Backend | **Express.js** + JavaScript |
| ORM | **Prisma** |
| БД | **PostgreSQL** (Docker) |
| Frontend | **React** + Vite |
| Real-time | **Socket.io** (WebSocket) |
| Кэш/очередь (Junior+) | **Redis** + **BullMQ** |
| Auth (Junior+) | **JWT** |
| Контейнеры | **Docker Compose** |

---

## Этап 0. Подготовка (до кода)

### Задача 1 — Репозиторий на GitHub
- Создать репозиторий `comments-app` (публичный или private).
- Добавить `.gitignore` (Node, `.env`, `uploads/`, `node_modules/`, `dist/`).
- Локально: `git clone`, первый коммит с README-заготовкой.

### Задача 2 — Выбор стека (зафиксировать в README)
- Зафиксировать стек в `README.md` (см. таблицу выше).

### Задача 3 — Структура монорепо (папки в корне)
```
comments-app/
├── backend/
├── frontend/
├── docker/
├── docs/              # схема БД, диаграммы, этот план
├── docker-compose.yml
├── .env.example
└── README.md
```

### Задача 4 — Ветки Git (стратегия)
- `main` — стабильная версия.
- `dev` — основная разработка.
- feature-ветки: `feature/auth`, `feature/comments`, `feature/captcha` и т.д.
- Коммиты небольшими логическими шагами (история веток — часть проверки).

---

## Этап 1. Backend — инициализация

### Задача 5 — Создать папку backend
```bash
mkdir backend && cd backend
npm init -y
```

### Задача 6 — Установить зависимости backend
```bash
# Основные
npm install express cors helmet dotenv
npm install prisma @prisma/client
npm install bcrypt jsonwebtoken
npm install express-validator
npm install multer sharp          # загрузка и ресайз изображений
npm install svg-captcha           # CAPTCHA
npm install sanitize-html         # XSS
npm install socket.io
npm install ioredis bullmq        # Junior+: кэш и очередь

# Dev
npm install -D nodemon
```

### Задача 7 — Структура папок backend
```
backend/
├── src/
│   ├── index.js                 # точка входа, запуск сервера
│   ├── app.js                   # Express app, middleware, routes
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── commentController.js
│   │   ├── captchaController.js
│   │   ├── authController.js
│   │   └── uploadController.js
│   ├── services/                # OOP: бизнес-логика
│   │   ├── CommentService.js
│   │   ├── CaptchaService.js
│   │   ├── UploadService.js
│   │   └── SanitizeService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── validateMiddleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── commentRoutes.js
│   │   ├── captchaRoutes.js
│   │   └── authRoutes.js
│   ├── utils/
│   │   ├── regex.js             # валидация HTML-тегов
│   │   └── pagination.js
│   ├── events/                  # Junior+: EventEmitter
│   │   └── commentEvents.js
│   ├── queues/                  # Junior+: BullMQ
│   │   └── emailQueue.js
│   └── websocket/
│       └── commentSocket.js
├── prisma/
│   └── schema.prisma
├── uploads/                     # файлы пользователей
├── package.json
└── prisma.config.ts
```

### Задача 8 — Базовый Express-сервер
- `src/app.js`: `express()`, `cors`, `helmet`, `express.json()`, статика для uploads.
- `src/index.js`: `app.listen(PORT)`, подключение WebSocket.
- Проверка: `GET /api/health` → `{ status: "ok" }`.

### Задача 9 — `.env` и конфиг
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/comments
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
PORT=3001
UPLOAD_DIR=./uploads
```

---

## Этап 2. База данных

### Задача 10 — Схема Prisma (модели)
**Таблицы:**
- `users` — id, username, email, homepage, client_meta, created_at
- `comments` — id, user_id, parent_id (nullable, для вложенности), text, created_at
- `attachments` — id, comment_id, type (image/txt), path, original_name
- `captcha_sessions` — для CAPTCHA (или Redis)

**Связи:**
- User → много Comments
- Comment → parent Comment (self-reference)
- Comment → много Attachments

### Задача 11 — Миграции
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Задача 12 — Файл схемы для MySQL Workbench
- Экспорт ER-диаграммы в `docs/db-schema.sql` или `.mwb`.
- Требование ТЗ: схема должна открываться в MySQL Workbench.

---

## Этап 3. Backend — API комментариев

### Задача 13 — CommentService (OOP)

**Файл:** `backend/src/services/CommentService.js`

**Зачем этот слой:** контроллер (задача 14) принимает HTTP-запрос, а **CommentService** содержит всю бизнес-логику работы с комментариями и БД. Так проще тестировать, переиспользовать код и не смешивать Express с Prisma.

**Зависимости:**
- `backend/src/prisma.js` — клиент Prisma
- модели из `backend/prisma/schema.prisma`: `User`, `Comment`, `Attachment`

**Структура класса:**
```js
class CommentService {
  async createComment(data) { ... }
  async getComments(page, sortBy, sortOrder) { ... }
  async getReplies(parentId) { ... }
  buildTree(comments) { ... }
}
export default new CommentService(); // или export class + создание в controller
```

---

#### `createComment(data)`

**Для чего:** сохранить новый комментарий в БД — корневой (в таблицу на главной) или ответ (reply) на другой комментарий.

**Почему отдельная функция:** создание комментария — не одна строка в БД. Нужно сначала найти/создать пользователя, проверить parent, связать записи и вернуть готовый объект для API/WebSocket.

**Что принимает (`data`):**
```js
{
  // данные автора (из формы, задача 15)
  username: string,      // "JohnDoe"
  email: string,         // "john@mail.com"
  homepage?: string,     // "https://example.com" или null
  client_meta: string,   // JSON-строка: IP, User-Agent и т.д.

  // сам комментарий
  text: string,          // HTML-текст (sanitize — задача 16, здесь уже очищенный)
  parentId?: string,     // id родителя; если нет — корневой комментарий
}
```

**Что делает внутри (пошагово):**
1. **User:** `upsert` по `email` (email уникален в схеме) — если пользователь уже есть, обновить `username`/`homepage`; если нет — создать.
2. **Parent (если `parentId` передан):**
   - проверить, что комментарий с таким `id` существует;
   - если нет — ошибка (например, `404 Parent comment not found`).
3. **Comment:** создать запись:
   - `text`, `userId`, `parentId` (или `null` для корневого).
4. **Include:** вернуть комментарий **с пользователем** (`user: { username, email, homepage }`), чтобы контроллер сразу отдал JSON на фронт.

**Что возвращает:**
```js
{
  id: "uuid",
  text: "...",
  createdAt: "2026-05-27T...",
  updatedAt: "2026-05-27T...",
  parentId: null,           // или uuid родителя
  user: {
    id: "uuid",
    username: "JohnDoe",
    email: "john@mail.com",
    homepage: "https://..."
  },
  attachment: []            // вложения — задача 18, пока пустой массив
}
```

**Ошибки (бросать или возвращать через контроллер):**
- родитель не найден → `404`
- ошибка Prisma → пробросить дальше в `errorHandler`

**Не делает в задаче 13 (это другие задачи):**
- валидация полей → задача 15
- sanitize HTML → задача 16
- CAPTCHA → задача 17
- загрузка файлов → задача 18

---

#### `getComments(page, sortBy, sortOrder)`

**Для чего:** получить **только корневые** комментарии для главной таблицы (User Name, E-mail, Date) с пагинацией и сортировкой.

**Почему отдельная функция:** главная страница показывает не все комментарии, а корневые (`parentId = null`), по 25 штук, с сортировкой — это отдельный запрос к БД.

**Что принимает:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `page` | number | `1` | Номер страницы (с 1) |
| `sortBy` | string | `"createdAt"` | Поле сортировки: `username`, `email`, `createdAt` |
| `sortOrder` | string | `"desc"` | `asc` или `desc`; **LIFO = desc** (новые сверху) |

**Что делает внутри:**
1. `const limit = 25`, `const skip = (page - 1) * 25`
2. Prisma `findMany`:
   - `where: { parentId: null }` — только корневые
   - `include: { user: true }` — имя и email автора
   - `orderBy` — по `createdAt` или через relation `user.username` / `user.email`
   - `skip`, `take: 25`
3. `count` с тем же `where` — для пагинации

**Что возвращает:**
```js
{
  comments: [
    {
      id: "uuid",
      text: "...",
      createdAt: "...",
      user: { username: "...", email: "...", homepage: "..." }
    }
  ],
  pagination: {
    page: 1,
    limit: 25,
    total: 100,        // всего корневых комментариев
    totalPages: 4      // Math.ceil(total / 25)
  }
}
```

**Почему LIFO по умолчанию:** по ТЗ новые комментарии должны быть сверху → `sortOrder: "desc"` по `createdAt`.

---

#### `getReplies(parentId)`

**Для чего:** получить **прямые ответы** (один уровень) на конкретный комментарий — для кнопки «показать ответы» или endpoint `GET /api/comments/:id/replies`.

**Почему отдельно от `getComments`:** корневые — в таблице на главной; ответы подгружаются по `parentId`, когда пользователь раскрывает ветку.

**Что принимает:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `parentId` | string | UUID родительского комментария |

**Что делает внутри:**
1. Проверить, что родитель существует (опционально, но лучше для 404).
2. `findMany({ where: { parentId }, include: { user: true, attachment: true }, orderBy: { createdAt: "asc" } })` — ответы обычно старые → новые (хронология внутри ветки).

**Что возвращает:**
```js
[
  {
    id: "uuid",
    text: "...",
    createdAt: "...",
    parentId: "uuid-родителя",
    user: { username, email, homepage },
    attachment: []
  }
]
```

**Примечание:** эта функция возвращает **один уровень**. Для полного дерева любой глубины используется `buildTree`.

---

#### `buildTree(comments)`

**Для чего:** из **плоского списка** комментариев собрать **дерево** `{ ...comment, replies: [...] }` для фронта (задача 31 — вложенные комментарии с отступами).

**Почему отдельная функция:** в БД комментарии хранятся плоско (`parentId`), а UI показывает дерево. Преобразование — чистая логика без запросов к БД → обычный **синхронный** метод (не `async`).

**Что принимает:**
```js
comments // массив комментариев с полями id, parentId, text, user, ...
```

**Что делает внутри (алгоритм):**
1. Создать `Map`: `id → { ...comment, replies: [] }`
2. Пройти по массиву:
   - если `parentId === null` → корень, добавить в `roots[]`
   - иначе → найти родителя в Map и `push` в `parent.replies`
3. Вернуть `roots`

**Что возвращает:**
```js
[
  {
    id: "1",
    text: "Корневой",
    parentId: null,
    user: { ... },
    replies: [
      {
        id: "2",
        text: "Ответ",
        parentId: "1",
        replies: [
          { id: "3", text: "Ответ на ответ", parentId: "2", replies: [] }
        ]
      }
    ]
  }
]
```

**Когда вызывать:**
- если загружаете все комментарии одним запросом и строите дерево на бэке;
- или после `getReplies` + рекурсивной подгрузки на фронте (оба подхода допустимы).

---

#### Чеклист задачи 13

- [ ] `backend/src/services/CommentService.js` — класс с 4 методами
- [ ] `createComment` — upsert User + create Comment
- [ ] `getComments` — только `parentId: null`, 25/стр, LIFO
- [ ] `getReplies` — ответы по `parentId`
- [ ] `buildTree` — плоский массив → дерево
- [ ] Все методы используют `prisma` из `src/prisma.js`
- [ ] Контроллер и роуты — **задача 14**, здесь не делаем

### Задача 14 — CommentController + Routes
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/comments` | Список (таблица, сортировка, пагинация) |
| GET | `/api/comments/:id/replies` | Ответы на комментарий |
| POST | `/api/comments` | Новый комментарий |
| POST | `/api/comments/:id/reply` | Ответ на комментарий |
| POST | `/api/comments/preview` | Preview без сохранения (AJAX) |

### Задача 15 — Валидация формы (express-validator)
| Поле | Правило |
|------|---------|
| username | `[a-zA-Z0-9]+`, обязательное |
| email | email format, обязательное |
| homepage | URL, необязательное |
| text | обязательное, только разрешённые HTML-теги |
| captcha | обязательное, сверка с сессией |

### Задача 16 — SanitizeService (XSS + HTML)
- Разрешённые теги: `<a>`, `<code>`, `<i>`, `<strong>`.
- Regex: проверка закрытых тегов, валидный XHTML.
- `sanitize-html` + своя regex-логика.

### Задача 17 — CAPTCHA
- `GET /api/captcha` → SVG/PNG + session id.
- `CaptchaService`: генерация, хранение в Redis/сессии, проверка при POST.

### Задача 18 — Загрузка файлов
- `multer` + `UploadService`:
  - **Изображения**: JPG/GIF/PNG, ресайз до 320×240 (`sharp`).
  - **Текстовые**: `.txt`, макс. 100 KB.
- Сохранение в `uploads/`, запись в `attachments`.

### Задача 19 — Middleware безопасности
- `helmet` — заголовки.
- Prisma parameterized queries — защита от SQL injection.
- `rateLimiter` — лимит запросов.
- `authMiddleware` — JWT (Junior+).

---

## Этап 4. WebSocket (real-time)

### Задача 20 — Socket.io
- При новом комментарии → `io.emit("newComment", comment)`.
- Фронт подписывается и обновляет список без перезагрузки.
- Файл: `src/websocket/commentSocket.js`.

---

## Этап 5. Junior+ фичи

### Задача 21 — JWT Auth
- Регистрация/логин (опционально для ТЗ, но в требованиях Junior+).
- Middleware проверки токена.

### Задача 22 — Redis Cache
- Кэш списка комментариев (страница + сортировка).
- Инвалидация при новом комментарии.

### Задача 23 — BullMQ (очередь)
- Асинхронные задачи: обработка изображений, email-уведомления.

### Задача 24 — Events (EventEmitter)
- `comment:created` → cache invalidate, websocket emit, queue job.

---

## Этап 6. Frontend — инициализация

### Задача 25 — Создать frontend
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios socket.io-client react-router-dom
npm install lightbox2 @types/lightbox2
```

### Задача 26 — Структура frontend
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   └── commentsApi.ts
│   ├── components/
│   │   ├── CommentForm.tsx       # форма добавления
│   │   ├── CommentTable.tsx      # таблица корневых
│   │   ├── CommentTree.tsx       # вложенные ответы
│   │   ├── CommentItem.tsx
│   │   ├── Captcha.tsx
│   │   ├── TagToolbar.tsx        # [i] [strong] [code] [a]
│   │   ├── FileUpload.tsx
│   │   ├── PreviewModal.tsx      # AJAX preview
│   │   └── Pagination.tsx
│   ├── hooks/
│   │   ├── useComments.ts
│   │   └── useSocket.ts
│   ├── utils/
│   │   └── validation.ts         # клиентская валидация
│   └── styles/
│       └── main.css
├── index.html
└── vite.config.ts
```

### Задача 27 — Главная страница
- Таблица корневых комментариев: User Name, E-mail, Date.
- Сортировка по клику на заголовок (↑↓).
- Пагинация: 25 на страницу.
- LIFO по умолчанию.

### Задача 28 — Форма комментария
- Поля: username, email, homepage, captcha, text.
- TagToolbar: кнопки `[i]`, `[strong]`, `[code]`, `[a]`.
- Кнопки: **Preview**, **Submit**.
- Загрузка файла (image/txt).

### Задача 29 — Клиентская валидация
- Те же правила, что на сервере.
- Показ ошибок под полями.

### Задача 30 — AJAX Preview
- POST `/api/comments/preview` → модалка с отрендеренным HTML.
- Без перезагрузки страницы.

### Задача 31 — Вложенные комментарии
- Клик «Reply» → форма под комментарием.
- Дерево с отступами (как в макете).
- Quote-стиль для цитирования.

### Задача 32 — Lightbox2
- Просмотр изображений с эффектами.
- Ссылка на скачивание `.txt`.

### Задача 33 — WebSocket на фронте
- `useSocket` hook → автообновление при новых комментариях.

### Задача 34 — CSS / дизайн
- Базовая вёрстка по макету.
- Адаптивность, таблица, форма, дерево комментариев.

---

## Этап 7. Docker

### Задача 35 — Dockerfile backend
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start"]
```

### Задача 36 — Dockerfile frontend
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

### Задача 37 — docker-compose.yml
Сервисы:
- `backend` (Express)
- `frontend` (Nginx)
- `postgres`
- `redis`

Проверка: `docker compose up --build` — всё поднимается с нуля.

---

## Этап 8. Деплой и документация

### Задача 38 — Деплой на VDS
- VPS (DigitalOcean, Hetzner, Yandex Cloud и т.п.).
- Docker Compose на сервере.
- Домен + HTTPS (Let's Encrypt / Caddy).

### Задача 39 — README.md
- Описание проекта.
- Стек технологий.
- Инструкция запуска с нуля (`git clone` → `docker compose up`).
- API endpoints.
- Переменные окружения.

### Задача 40 — Схема БД
- `docs/db-schema.sql` или `.mwb` для MySQL Workbench.

### Задача 41 — Видео-демо
- 3–5 мин: форма, CAPTCHA, preview, вложенные комментарии, сортировка, пагинация, загрузка файлов, real-time.

### Задача 42 — Самопроверка
- Клонировать репо на чистую машину.
- Запустить только по README.
- Пройти чеклист ТЗ.

---

## Порядок выполнения (кратко)

```
1. GitHub + первый коммит + ветки
2. Backend init (npm, структура, Express)
3. БД + Prisma schema + миграции
4. API + валидация + CAPTCHA + файлы + security
5. WebSocket
6. Junior+ (JWT, Redis, BullMQ, Events)
7. Frontend (React + Vite)
8. Docker full stack
9. Деплой + README + схема БД + видео
```

---

## Чеклист по ТЗ (для самопроверки)

- [ ] Форма: username, email, homepage, CAPTCHA, text
- [ ] Валидация client + server
- [ ] Разрешённые HTML-теги + regex
- [ ] XSS / SQL injection защита
- [ ] Таблица корневых комментариев
- [ ] Сортировка: name, email, date (↑↓)
- [ ] Пагинация 25/стр, LIFO по умолчанию
- [ ] Вложенные комментарии (любая глубина)
- [ ] Загрузка image (320×240) и txt (100KB)
- [ ] Lightbox2 для просмотра
- [ ] AJAX Preview
- [ ] Tag toolbar
- [ ] WebSocket real-time
- [ ] OOP (Services)
- [ ] ORM + SQL БД
- [ ] Docker
- [ ] Git с ветками
- [ ] README + схема БД + видео

---

## Текущий прогресс

| Задача | Статус |
|--------|--------|
| 1–4 — GitHub, структура, ветки | частично |
| 5–6 — backend/, npm, зависимости | ✅ |
| 7 — структура папок backend | ⏳ начато |
| 8–9 — Express-сервер, .env | ⏳ частично |
| 10 — Prisma schema | ⏳ черновик (нужны правки) |
| 11+ — миграции, API, frontend, Docker | ❌ впереди |

**Следующий шаг:** исправить `backend/prisma/schema.prisma` → `npx prisma migrate dev` → доработать структуру папок backend.
