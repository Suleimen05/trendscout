# TrendScout Server API

Python FastAPI backend для анализа трендов TikTok.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=postgresql://user:password@host:port/database
APIFY_API_TOKEN=your_apify_token
ANTHROPIC_API_KEY=your_anthropic_key
SECRET_KEY=your_secret_key
```

### 3. Настройка базы данных

Убедитесь, что PostgreSQL запущен и установлено расширение `pgvector`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Запуск сервера

```bash
python -m app.main
```

Сервер запустится на: **http://localhost:8000**

API документация: **http://localhost:8000/docs**

## 📚 API Endpoints

### Trends
- `POST /api/trends/search` - Поиск трендов
- `GET /api/trends/results` - Получить сохраненные результаты

### Profiles
- `GET /api/profiles/{username}` - Получить профиль пользователя
- `GET /api/profiles/{username}/spy` - Spy режим (с кэшированием)

## 🛠 Технологии

- **FastAPI** - Web framework
- **PostgreSQL** + **pgvector** - База данных
- **SQLAlchemy** - ORM
- **Apify** - TikTok data collection
- **APScheduler** - Background tasks

## 📖 Документация

Полная документация доступна по адресу `/docs` после запуска сервера.

## 🔒 Безопасность

- Никогда не коммитьте `.env` файл
- Используйте сильные пароли для базы данных
- Храните API ключи в переменных окружения

## 📝 Лицензия

Создано для образовательных и коммерческих целей.
