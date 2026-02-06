# REVIEW_MODE - OAuth Integration TODO

## Текущее состояние проекта

**Проект:** Rizko.ai - TikTok Trend Analysis Platform
**Режим:** REVIEW_MODE=true (для прохождения API Review у TikTok, Meta, Google)
**URL:** https://rizko.ai

---

## ✅ Что уже работает

### Backend (FastAPI)
- ✅ Регистрация и авторизация пользователей (JWT)
- ✅ Google OAuth (полностью работает)
- ✅ TikTok OAuth callback endpoint
- ✅ Instagram OAuth callback endpoint
- ✅ YouTube OAuth callback endpoint
- ✅ База данных PostgreSQL (Railway)
- ✅ Feedback система с Discord webhook
- ✅ Gemini AI интеграция

### Frontend (React + TypeScript)
- ✅ Landing page
- ✅ Страница логина/регистрации
- ✅ Dashboard
- ✅ Страница "Connect Accounts" - UI для подключения аккаунтов
- ✅ Страница "My Videos" - UI с mock данными
- ✅ Settings, Help, Privacy Policy, Terms of Service
- ✅ Темная/светлая тема
- ✅ Responsive дизайн

### OAuth Flow
- ✅ Пользователь может нажать "Connect TikTok/Instagram/YouTube"
- ✅ Редирект на OAuth платформы
- ✅ Callback обрабатывается на backend

---

## ❌ Что НЕ работает (нужно доделать)

### 1. Сохранение OAuth токенов в БД
**Проблема:** После OAuth callback токены не сохраняются в базу данных

**Что нужно:**
- Создать таблицу `social_accounts` в БД:
  ```sql
  CREATE TABLE social_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,  -- 'tiktok', 'instagram', 'youtube'
    platform_user_id VARCHAR(255),
    username VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform)
  );
  ```

**Файлы для изменения:**
- `server/app/models/social_account.py` - создать новую модель
- `server/app/api/routes/oauth.py` - сохранять токены после callback
- `server/alembic/versions/` - создать миграцию

---

### 2. API endpoints для получения данных с платформ

**Проблема:** Нет endpoints для получения реальных видео пользователя

**Что нужно создать:**

#### TikTok API
```python
# GET /api/v1/social/tiktok/videos
# Получить видео пользователя через TikTok Official API
```

**Документация:**
- TikTok Login Kit: https://developers.tiktok.com/doc/login-kit-web
- TikTok Display API: https://developers.tiktok.com/doc/display-api-get-started

**Что получать:**
- video_id, caption, view_count, like_count, comment_count, share_count
- thumbnail_url, create_time, duration

#### YouTube API
```python
# GET /api/v1/social/youtube/videos
# Получить видео канала через YouTube Data API v3
```

**Документация:**
- YouTube Data API: https://developers.google.com/youtube/v3/docs

**Что получать:**
- video_id, title, description, view_count, like_count, comment_count
- thumbnail_url, published_at

#### Instagram API
```python
# GET /api/v1/social/instagram/media
# Получить медиа через Instagram Graph API
```

**Документация:**
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api

**Что получать:**
- media_id, caption, like_count, comments_count
- media_url, timestamp, media_type

**Файлы для создания:**
- `server/app/api/routes/social_platforms.py` - новый роутер
- `server/app/services/tiktok_api.py` - работа с TikTok API
- `server/app/services/youtube_api.py` - работа с YouTube API
- `server/app/services/instagram_api.py` - работа с Instagram API

---

### 3. Frontend - подключение реальных данных

**Проблема:** Страница "My Videos" показывает mock данные

**Что нужно:**
- Создать API клиент для запросов к `/api/v1/social/{platform}/videos`
- Заменить mock данные на реальные
- Добавить loading states и error handling
- Показывать данные с разных платформ (TikTok, Instagram, YouTube)

**Файлы для изменения:**
- `client/src/pages/MyVideos.tsx` - заменить mockVideos на реальный API запрос
- `client/src/lib/api.ts` - добавить методы для social platforms

---

### 4. AI Анализ и рекомендации (опционально)

**Что можно добавить:**
- Базовый AI-анализ через Gemini:
  - Какой контент работает лучше
  - Рекомендации по времени постинга
  - Анализ engagement rate
  - Советы по улучшению контента

**Файл:**
- `server/app/services/ai_insights.py` - AI рекомендации для видео

---

## 📋 План работы (приоритеты)

### Фаза 1: Хранение токенов (КРИТИЧНО)
1. Создать модель `SocialAccount`
2. Создать миграцию БД
3. Обновить OAuth callbacks для сохранения токенов
4. Добавить endpoint для проверки подключенных аккаунтов

### Фаза 2: TikTok интеграция (ПРИОРИТЕТ 1)
1. Получить TikTok API credentials (если еще нет)
2. Создать `tiktok_api.py` service
3. Реализовать endpoint `/api/v1/social/tiktok/videos`
4. Протестировать получение данных

### Фаза 3: YouTube интеграция (ПРИОРИТЕТ 2)
1. Получить YouTube API credentials (если еще нет)
2. Создать `youtube_api.py` service
3. Реализовать endpoint `/api/v1/social/youtube/videos`
4. Протестировать получение данных

### Фаза 4: Instagram интеграция (ПРИОРИТЕТ 3)
1. Получить Instagram API credentials (если еще нет)
2. Создать `instagram_api.py` service
3. Реализовать endpoint `/api/v1/social/instagram/media`
4. Протестировать получение данных

### Фаза 5: Frontend обновление
1. Создать API клиент методы
2. Обновить MyVideos.tsx для реальных данных
3. Добавить фильтры по платформам
4. Добавить loading/error states

### Фаза 6: AI Insights (опционально)
1. Базовая аналитика через Gemini
2. Показывать рекомендации на странице

---

## 🔑 API Credentials (нужно получить)

### TikTok
- Client Key
- Client Secret
- Redirect URI: https://rizko.ai/api/v1/oauth/tiktok/callback

### YouTube (Google)
- ✅ Уже есть (используется для Google OAuth)
- Проверить scope для YouTube Data API

### Instagram (Meta)
- App ID
- App Secret
- Redirect URI: https://rizko.ai/api/v1/oauth/instagram/callback

---

## 🗂️ Структура файлов

```
server/app/
├── models/
│   ├── user.py ✅
│   └── social_account.py ❌ СОЗДАТЬ
├── api/routes/
│   ├── oauth.py ✅ (обновить для сохранения токенов)
│   └── social_platforms.py ❌ СОЗДАТЬ
├── services/
│   ├── tiktok_api.py ❌ СОЗДАТЬ
│   ├── youtube_api.py ❌ СОЗДАТЬ
│   ├── instagram_api.py ❌ СОЗДАТЬ
│   └── ai_insights.py ❌ СОЗДАТЬ (опционально)
└── alembic/versions/
    └── xxx_add_social_accounts.py ❌ СОЗДАТЬ

client/src/
├── pages/
│   ├── MyVideos.tsx ✅ (обновить для реальных данных)
│   └── ConnectAccounts.tsx ✅ (обновить статусы подключения)
└── lib/
    └── api.ts ✅ (добавить методы для social platforms)
```

---

## 🔍 Текущие environment variables

### Backend (.env или Railway)
```bash
# Database
DATABASE_URL=postgresql://...

# JWT
SECRET_KEY=...
ALGORITHM=HS256

# Google OAuth ✅
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# TikTok OAuth ❌ ДОБАВИТЬ
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...

# Instagram OAuth ❌ ДОБАВИТЬ
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...

# YouTube API ✅ (используется тот же Google credentials)

# Gemini AI ✅
GEMINI_API_KEY=...

# Discord ✅
DISCORD_WEBHOOK_URL=...
```

### Frontend (.env.local)
```bash
# Review Mode
VITE_REVIEW_MODE=true

# Dev Access (опционально)
VITE_DEV_ACCESS=false
VITE_DEV_PASSWORD=...

# API URL
VITE_API_URL=https://rizko.ai/api/v1
```

---

## 📚 Полезные ссылки

### API Documentation
- **TikTok Login Kit:** https://developers.tiktok.com/doc/login-kit-web
- **TikTok Display API:** https://developers.tiktok.com/doc/display-api-get-started
- **YouTube Data API v3:** https://developers.google.com/youtube/v3/docs
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **Meta OAuth:** https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow

### Database
- **Railway PostgreSQL:** https://railway.app
- **Alembic Migrations:** https://alembic.sqlalchemy.org/en/latest/

### AI
- **Google Gemini API:** https://ai.google.dev/docs

---

## 🐛 Known Issues

1. **OAuth токены не сохраняются** - после callback нужно сохранять в БД
2. **Mock данные на My Videos** - нужно подключить реальные API
3. **Нет refresh token logic** - нужно обрабатывать истечение токенов
4. **Нет rate limiting** - API платформ имеют лимиты запросов

---

## 💡 Рекомендации

1. **Начни с TikTok** - это основная платформа проекта
2. **Сначала сохранение токенов** - без этого ничего не заработает
3. **Используй async/await** - для параллельных запросов к API
4. **Добавь кэширование** - чтобы не делать лишние запросы к платформам
5. **Логируй все ошибки** - для дебага OAuth и API запросов

---

## 📞 Контакты

- **Production URL:** https://rizko.ai
- **GitHub:** https://github.com/akyline-ai/trendscout
- **Railway:** Dashboard для deployment

---

## Последнее обновление

**Дата:** 3 февраля 2026
**Статус:** Готов к интеграции Official APIs
**Текущий commit:** 56c7351 (Crop logo to remove excess transparent space)

---

**Примечание:** Это REVIEW_MODE версия для прохождения API Review у платформ. После одобрения можно будет включить полные фичи (Apify scraping, AI Scripts, Competitors и т.д.) переключив `REVIEW_MODE=false`.
