# Rizko.ai — Client (Frontend)

React SPA для платформы аналитики контента и AI-автоматизации.

## Технологии

- **React 19** + **TypeScript** — UI
- **Vite 7** — Сборка и dev-сервер
- **Tailwind CSS 3** + **tailwindcss-animate** — Стили
- **shadcn/ui** (Radix UI) — Компоненты
- **React Router 7** — Маршрутизация
- **react-i18next** — Локализация (EN / RU)
- **Recharts** — Графики и аналитика
- **Axios** — HTTP клиент
- **Lucide React** — Иконки
- **React Markdown** — Рендеринг Markdown
- **Sonner** — Toast уведомления
- **Embla Carousel** — Карусели
- **Supabase JS** — Авторизация / хранилище

## Быстрый старт

### 1. Установка

```bash
npm install
```

### 2. Переменные окружения

Создайте `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 3. Запуск

```bash
npm run dev
```

Приложение: **http://localhost:5173**

### 4. Сборка

```bash
npm run build
```

## Страницы

| Страница | Описание |
|----------|----------|
| **LandingPage** | Лендинг с описанием продукта |
| **LoginPage / RegisterPage** | Авторизация / Регистрация |
| **Dashboard** | Главная панель с аналитикой и графиками |
| **Trending** | Поиск и анализ трендов TikTok |
| **Discover** | Обнаружение контента и идей |
| **Competitors** | Отслеживание конкурентов |
| **CompetitorFeed** | Лента контента конкурента |
| **AccountSearch** | Поиск аккаунтов по платформам |
| **AIWorkspace** | AI чат с несколькими моделями (Gemini, Claude, GPT) |
| **AIScripts** | AI генерация сценариев для видео |
| **WorkflowBuilder** | Визуальный конструктор AI-воркфлоу (нодовый редактор) |
| **DeepAnalysis** | Глубокий анализ видео через Gemini Vision |
| **Saved / MyVideos** | Сохранённые видео и медиатека |
| **Settings** | Настройки профиля, тема, язык, уведомления |
| **ConnectAccounts** | Подключение соцсетей (TikTok, Instagram, YouTube, Twitter) |
| **Billing / Pricing** | Подписки и тарифные планы (Stripe) |
| **Marketplace** | Маркетплейс шаблонов и инструментов |
| **Feedback** | Обратная связь |
| **Help** | Справка и FAQ |

### Юридические страницы
PrivacyPolicy, TermsOfService, DataPolicy, DataDeletion, UsagePolicy

## Ключевые фичи

### Workflow Builder
Визуальный нодовый редактор для создания AI-пайплайнов:
- Типы нод: Video, Analyze, Extract, Style, Script, Publish
- Gemini Vision для анализа видео контента
- Сохранение / загрузка воркфлоу
- История запусков с закреплением, переименованием, удалением
- Шаблоны воркфлоу

### AI Chat
Мульти-модельный чат:
- Google Gemini, Anthropic Claude, OpenAI GPT
- Сессии с историей, закрепление и переименование
- Кредитная система с учётом стоимости моделей
- Режимы: скрипт, идеи, аналитика, тренды

### Локализация (i18n)
- Языки: English (default), Русский
- Stack: react-i18next + i18next-browser-languagedetector
- 22 namespace файла в `public/locales/{en,ru}/`
- Авто-определение языка браузера, сохранение в localStorage

### Тема
- Светлая / Тёмная тема
- CSS переменные через Tailwind

## Структура

```
src/
├── components/
│   ├── ui/              # shadcn/ui компоненты (Button, Dialog, DropdownMenu...)
│   ├── workflow/         # NodeConfigPanel, кастомные ноды
│   ├── Sidebar.tsx       # Основной сайдбар (desktop)
│   ├── UnifiedSidebar.tsx
│   ├── MobileSidebar.tsx
│   ├── VideoCard.tsx     # Карточка видео
│   ├── ErrorBoundary.tsx
│   └── ...
├── pages/               # 28 страниц приложения
├── contexts/
│   ├── AuthContext.tsx   # JWT авторизация, токены, refresh
│   ├── ChatContext.tsx   # AI чат сессии
│   ├── WorkflowContext.tsx # Воркфлоу, история запусков
│   └── ThemeContext.tsx  # Тема (light/dark)
├── hooks/
│   └── useLanguage.ts   # Переключение языка
├── services/
│   └── api.ts           # Axios клиент с auto-refresh токенов
├── lib/
│   ├── i18n.ts          # Конфигурация i18next
│   ├── config.ts        # Константы
│   └── utils.ts         # cn() и утилиты
└── main.tsx             # Entry point
```

```
public/
└── locales/
    ├── en/              # English translations (22 JSON files)
    └── ru/              # Russian translations (22 JSON files)
```

## Деплой

### Vercel / Netlify
1. Build command: `npm run build`
2. Output directory: `dist`
3. Установите переменные окружения (`VITE_API_URL`, etc.)

### Другие платформы
Загрузите содержимое `dist/` на любой статический хостинг.
