# 🚀 React Query интегрирован!

## ✅ Что установлено

```
✅ @tanstack/react-query - основная библиотека
✅ @tanstack/react-query-devtools - инструменты для отладки
✅ QueryClient настроен в App.tsx
✅ Хуки для поиска созданы (useSearchQuery.ts)
```

---

## 📦 Что было добавлено

### 1. QueryClient в App.tsx

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,  // 2 минуты - данные свежие
      gcTime: 5 * 60 * 1000,      // 5 минут - хранить в памяти
      retry: 1,                    // 1 повтор при ошибке
      refetchOnWindowFocus: true,  // Обновить при возврате
      refetchOnReconnect: true,    // Обновить при интернете
    },
  },
});
```

**Что это значит:**
- **staleTime: 2 минуты** - результаты поиска "свежие" 2 минуты
- **gcTime: 5 минут** - хранить в памяти 5 минут после последнего использования
- **retry: 1** - если ошибка, повторить 1 раз автоматически

---

### 2. Хуки для работы с данными

**Файл:** `/client/src/hooks/useSearchQuery.ts`

#### `useSearchQuery` - Поиск с кэшем
```typescript
const { data, isLoading, error } = useSearchQuery('dance', 'keywords');
```

#### `useFavoritesQuery` - Избранные видео
```typescript
const { data: favorites, isLoading } = useFavoritesQuery();
```

#### `useAddFavoriteMutation` - Добавить в избранное
```typescript
const addFavorite = useAddFavoriteMutation();
addFavorite.mutate(trendId);
```

#### `useCompetitorsQuery` - Конкуренты
```typescript
const { data: competitors } = useCompetitorsQuery();
```

#### `useAIScriptsQuery` - AI скрипты
```typescript
const { data: scripts } = useAIScriptsQuery();
```

---

## 🎯 Как использовать в компонентах

### Пример: Страница поиска (Discover.tsx)

**БЫЛО (без кэша):**
```typescript
function Discover() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    const data = await api.post('/trends/search', { query });
    setResults(data);
    setLoading(false);
  };

  // ❌ Каждый раз заново загружает при возврате
}
```

**СТАЛО (с React Query):**
```typescript
import { useSearchQuery } from '@/hooks/useSearchQuery';

function Discover() {
  const [query, setQuery] = useState('');
  const { data, isLoading, error } = useSearchQuery(query);

  // ✅ Автоматический кэш на 2 минуты!
  // ✅ При возврате - мгновенная загрузка из кэша
  // ✅ Фоновое обновление если данные устарели

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск..."
      />

      {isLoading && <p>Загрузка...</p>}
      {error && <p>Ошибка: {error.message}</p>}
      {data && data.results.map(video => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
}
```

---

## 🎬 ASCII: Как это работает

### Сценарий использования:

```
09:00:00  Пользователь ищет "dance"
            ↓
          useSearchQuery('dance')
            ↓
          Проверка кэша: НЕТ данных
            ↓
          ⏳ Запрос к API (2-5 секунд)
            ↓
          💾 Сохранить в кэш
            ↓
          ✨ Показать результаты


09:01:00  Ушел на страницу Settings
          (работает там 30 секунд)


09:01:30  Вернулся на Discover
            ↓
          useSearchQuery('dance')
            ↓
          Проверка кэша: ЕСТЬ! (прошло 1:30)
            ↓
          ✨ МГНОВЕННО показать из кэша (0.1с)
          Кэш свежий (<2 мин) → НЕ загружать заново


09:03:00  Ушел на Competitors (работает 2 минуты)


09:05:00  Вернулся на Discover
            ↓
          useSearchQuery('dance')
            ↓
          Проверка кэша: ЕСТЬ! (прошло 5 минут)
            ↓
          ✨ МГНОВЕННО показать СТАРЫЙ результат
            ↓
          Кэш устарел (>2 мин)
            ↓
          🔄 В ФОНЕ загружает СВЕЖИЕ данные
            ↓
          Когда пришли → плавно обновить экран
```

---

## 🛠️ React Query DevTools

### Как использовать:

1. Откройте приложение в браузере
2. Внизу справа появится иконка React Query 🔍
3. Кликните на неё → откроется панель

**Что показывает:**
```
┌─────────────────────────────────────────┐
│  React Query DevTools                   │
├─────────────────────────────────────────┤
│  Queries:                               │
│                                         │
│  ['search', 'dance', 'keywords']        │
│  └─ Status: success ✅                  │
│  └─ Last updated: 09:05:32              │
│  └─ Data age: 3m 15s                    │
│  └─ Stale: yes ⏰                       │
│                                         │
│  ['favorites']                          │
│  └─ Status: success ✅                  │
│  └─ Last updated: 09:04:10              │
│  └─ Data age: 4m 37s                    │
│  └─ Stale: yes ⏰                       │
│                                         │
│  [Actions]                              │
│  └─ Refetch All                         │
│  └─ Invalidate All                      │
│  └─ Clear Cache                         │
└─────────────────────────────────────────┘
```

---

## 📊 Настройки кэширования по типу данных

```typescript
Поиск (search):
  staleTime: 2 минуты    // Тренды меняются часто
  gcTime: 5 минут

Избранное (favorites):
  staleTime: 1 минута    // Пользователь может часто добавлять
  gcTime: 10 минут

Конкуренты (competitors):
  staleTime: 3 минуты    // Меняются редко
  gcTime: 10 минут

AI Скрипты (scripts):
  staleTime: 5 минут     // Меняются очень редко
  gcTime: 15 минут
```

---

## 🎮 Примеры использования

### 1. Автоматический поиск с debounce

```typescript
import { useSearchQuery } from '@/hooks/useSearchQuery';
import { useDebounce } from '@/hooks/useAsync';

function SearchPage() {
  const [inputValue, setInputValue] = useState('');
  const debouncedQuery = useDebounce(inputValue, 500); // 500ms задержка

  const { data, isLoading } = useSearchQuery(debouncedQuery);

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Печатай..."
      />
      {/* Запрос отправится только через 500ms после остановки печати */}
      {isLoading && <Spinner />}
      {data && <Results data={data} />}
    </div>
  );
}
```

### 2. Добавление в избранное с оптимистичным обновлением

```typescript
import { useAddFavoriteMutation } from '@/hooks/useSearchQuery';

function VideoCard({ video }) {
  const addFavorite = useAddFavoriteMutation();

  const handleLike = () => {
    addFavorite.mutate(video.id, {
      // Оптимистичное обновление
      onSuccess: () => {
        toast.success('Добавлено в избранное!');
      },
      onError: () => {
        toast.error('Ошибка при добавлении');
      },
    });
  };

  return (
    <button onClick={handleLike} disabled={addFavorite.isPending}>
      {addFavorite.isPending ? 'Добавление...' : 'Добавить'}
    </button>
  );
}
```

### 3. Предзагрузка данных (prefetch)

```typescript
import { useQueryClient } from '@tanstack/react-query';

function TrendingList({ trends }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = (query: string) => {
    // Предзагрузить данные при наведении
    queryClient.prefetchQuery({
      queryKey: ['search', query],
      queryFn: () => api.post('/trends/search', { query }),
    });
  };

  return (
    <div>
      {trends.map(trend => (
        <div
          key={trend.id}
          onMouseEnter={() => handleMouseEnter(trend.keyword)}
        >
          {trend.name}
        </div>
      ))}
    </div>
  );
}
```

---

## ⚡ Преимущества

### ДО React Query:
```
❌ Каждый раз заново загружает
❌ Нет кэша между страницами
❌ Нужно вручную писать loading/error states
❌ Дублирование кода в каждом компоненте
❌ Сложно отслеживать запросы
```

### ПОСЛЕ React Query:
```
✅ Автоматический кэш на 2-5 минут
✅ Мгновенная загрузка при возврате
✅ Автоматические loading/error states
✅ Один хук - использовать везде
✅ DevTools для отладки
✅ Фоновое обновление
✅ Автоповтор при ошибках
✅ Дедупликация запросов
```

---

## 🧪 Как протестировать

### 1. Запустить dev сервер:
```bash
npm run dev
```

### 2. Открыть в браузере:
```
http://localhost:5173
```

### 3. Тест кэширования:
1. Залогиниться
2. Перейти на Discover
3. Поиск "dance"
4. Подождать результаты
5. Перейти на другую страницу (Settings)
6. Вернуться на Discover
7. **Результаты появятся МГНОВЕННО!** ⚡

### 4. Открыть DevTools:
1. Внизу справа - иконка React Query
2. Посмотреть все queries
3. Увидеть статус кэша (fresh/stale)

---

## 📚 Документация

**Official React Query Docs:**
https://tanstack.com/query/latest/docs/framework/react/overview

**Key Concepts:**
- staleTime: когда данные устаревают
- gcTime: когда удалить из памяти
- refetchOnWindowFocus: обновить при фокусе
- enabled: когда включать query

---

## 🎯 Итог

```
┌──────────────────────────────────────────┐
│  ПОИСК ТЕПЕРЬ РАБОТАЕТ ТАК:              │
├──────────────────────────────────────────┤
│                                          │
│  Первый поиск:  ⏳ 2-5 сек               │
│  Второй поиск:  ✨ 0.1 сек (из кэша!)   │
│  Третий поиск:  ✨ 0.1 сек (из кэша!)   │
│                                          │
│  Через 2 минуты:                         │
│  Четвертый:     ✨ 0.1 сек старый        │
│                 🔄 фон обновление        │
│                 → плавно обновить        │
│                                          │
└──────────────────────────────────────────┘
```

**React Query = супермаркет с холодильником!** 🛒🧊

Купил пиццу → положил в холодильник → в следующий раз мгновенно достал!

---

**Готово к использованию!** 🚀
