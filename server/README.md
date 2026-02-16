# Rizko.ai — Server (Backend API)

FastAPI backend для платформы аналитики контента и AI-автоматизации.

## Технологии

- **FastAPI** + **Uvicorn** — Web framework
- **PostgreSQL** + **pgvector** — База данных с поддержкой векторного поиска
- **SQLAlchemy** + **Alembic** — ORM и миграции
- **Google Gemini** — AI генерация (скрипты, анализ видео, Vision API)
- **Anthropic Claude** / **OpenAI** — Альтернативные LLM
- **Apify** — Сбор данных TikTok / Instagram
- **yt-dlp** — Загрузка видео
- **Supabase** — Хранилище файлов (видео, аватары)
- **Stripe** — Подписки и платежи
- **APScheduler** — Фоновые задачи (обновление трендов, конкурентов)
- **Pillow** + **pillow-heif** — Обработка изображений

## Быстрый старт

### 1. Установка

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Переменные окружения

Создайте `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rizko_db
SECRET_KEY=your-secret-key
APIFY_API_TOKEN=your_apify_token
GOOGLE_GENAI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. База данных

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Запуск миграций:
```bash
alembic upgrade head
```

### 4. Запуск

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API: **http://localhost:8000** | Docs: **http://localhost:8000/docs**

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` — Регистрация
- `POST /login` — Авторизация (JWT)
- `POST /refresh` — Обновление токена
- `GET /me` — Профиль пользователя
- `GET|PATCH /me/settings` — Настройки
- `POST /oauth/sync` — Синхронизация OAuth аккаунтов
- `POST /logout` — Выход

### Trends (`/api/trends`)
- `POST /search` — Поиск трендов TikTok (через Apify)
- `GET /results` — Сохранённые результаты
- `GET /my-trends` — Тренды пользователя
- `GET /limits` — Лимиты поиска
- `DELETE /clear` — Очистка истории

### Competitors (`/api/competitors`)
- `GET /search/{username}` — Поиск каналов
- `GET /` — Список отслеживаемых конкурентов
- `POST /` — Добавить конкурента
- `GET|PATCH|DELETE /{username}` — CRUD конкурента
- `PUT /{username}/refresh` — Обновить данные
- `GET /{username}/spy` — Spy режим (подробная аналитика)
- `GET /{username}/feed` — Лента контента конкурента

### AI Chat (`/api/chat`)
- `GET /credits` — Баланс AI-кредитов
- `GET|POST /` — Список / Создание сессий
- `GET|PATCH|DELETE /{session_id}` — Управление сессией (переименование, закрепление)
- `GET /{session_id}/messages` — История сообщений
- `POST /{session_id}/messages` — Отправка сообщения (Gemini / Claude / GPT)

### AI Scripts (`/api/ai-scripts`)
- `POST /generate` — Генерация сценария
- `POST /chat` — Чат с AI по контенту

### Workflows (`/api/workflows`)
- `GET|POST /` — Список / Создание воркфлоу
- `GET|PATCH|DELETE /{workflow_id}` — CRUD воркфлоу
- `POST /{workflow_id}/duplicate` — Дублирование
- `POST /execute` — Запуск воркфлоу (граф нод с AI обработкой)
- `POST /analyze-video` — Анализ видео (Gemini Vision)
- `POST /upload-video-file` — Загрузка видео файла
- `GET /templates/list` — Шаблоны воркфлоу
- `GET /history/list` — История запусков
- `GET|PATCH|DELETE /history/{run_id}` — Управление запуском (переименование, закрепление, удаление)

### Favorites (`/api/favorites`)
- `GET|POST /` — Список / Сохранение
- `GET|PATCH|DELETE /{favorite_id}` — CRUD
- `POST|DELETE /bulk` — Массовые операции
- `GET /tags/all` — Теги
- `POST /save-video` — Сохранение видео в Supabase

### OAuth (`/api/oauth`)
- `GET /tiktok|instagram|youtube|twitter` — OAuth авторизация
- `GET /tiktok|instagram|youtube|twitter/callback` — Callback
- `GET /accounts` — Подключённые аккаунты
- `DELETE /accounts/{account_id}` — Отключение

### Stripe (`/api/stripe`)
- `POST /create-checkout-session` — Создание оплаты
- `POST /create-portal-session` — Портал управления подпиской
- `GET /subscription` — Статус подписки
- `POST /webhook` — Stripe webhooks

### Usage (`/api/usage`)
- `GET /` — Статистика использования
- `POST /auto-mode` — Авто-режим сбора

### Feedback (`/api/feedback`)
- `POST /` — Отправка обратной связи
- `GET /my` — Мои отзывы
- Admin: `GET /admin/all`, `PATCH|DELETE /admin/{id}`, `GET /admin/stats`

### Insights (`/api/insights`)
- `GET /` — Аналитика дашборда
- `GET /refresh` — Принудительное обновление

### Other
- `GET /api/proxy/image` — Проксирование изображений
- `GET /api/profiles/{username}` — Профиль TikTok

## Структура

```
app/
├── api/                 # API endpoints
│   ├── routes/          # Auth, OAuth, Stripe, Feedback, Insights, Usage
│   ├── trends.py        # Поиск трендов
│   ├── competitors.py   # Отслеживание конкурентов
│   ├── chat_sessions.py # AI чат
│   ├── ai_scripts.py    # AI генерация скриптов
│   ├── workflows.py     # Workflow builder + execution
│   ├── favorites.py     # Сохранённые видео
│   └── proxy.py         # Image proxy
├── core/                # Config, database, security
├── db/
│   ├── models.py        # SQLAlchemy модели
│   └── migrations/      # Alembic миграции
├── services/            # Бизнес-логика
│   ├── collector.py     # TikTok данные (Apify)
│   ├── instagram_collector.py
│   ├── video_analyzer.py     # Gemini Vision анализ видео
│   ├── gemini_script_generator.py  # AI скрипты
│   ├── storage.py       # Supabase storage
│   ├── scorer.py        # Скоринг трендов
│   ├── scheduler.py     # Фоновые задачи
│   └── workflow_templates.py
└── main.py              # Entry point
```

## Безопасность

- JWT аутентификация с refresh-токенами
- Изоляция данных по пользователям (multi-tenant)
- Rate limiting на API
- Никогда не коммитьте `.env`
