# TrendScout - TikTok Trend Analysis Platform

Fullstack приложение для анализа трендов TikTok с AI-генерацией скриптов и отслеживанием конкурентов.

## 📁 Структура проекта

```
trendscout/
├── server/           # Python FastAPI Backend
│   ├── app/          # Основной код приложения
│   ├── requirements.txt
│   └── README.md     # Документация server
│
└── client/           # Vite + React Frontend
    ├── src/          # Исходный код
    ├── package.json
    └── README.md     # Документация client
```

## 🚀 Быстрый старт

### Server (Backend)

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Создайте .env файл (см. server/.env.example)
python -m app.main
```

Server запустится на: **http://localhost:8000**

### Client (Frontend)

```bash
cd client
npm install

# Создайте .env файл с: VITE_API_URL=http://localhost:8000/api
npm run dev
```

Client запустится на: **http://localhost:5173**

## 📚 Документация

- **Server**: См. [server/README.md](./server/README.md)
- **Client**: См. [client/README.md](./client/README.md)

## 🛠 Технологии

### Backend
- FastAPI
- PostgreSQL + pgvector
- Apify (TikTok scraping)
- APScheduler

### Frontend
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Router

## 🔒 Безопасность

- Никогда не коммитьте `.env` файлы
- Используйте `.env.example` как шаблон
- Храните секреты в переменных окружения на хостинге

## 📝 Лицензия

Создано для образовательных и коммерческих целей.
