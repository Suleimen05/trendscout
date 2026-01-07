import time
from typing import List

class ViralContentFilter:
    def __init__(self, business_keywords: List[str] = None, min_views: int = 1000):
        """
        business_keywords: Список слов, которые мы ищем (приходят из Dashboard).
        """
        # Если слова передали - используем их. Если нет - пустой список (фильтр будет строгим)
        raw_keywords = business_keywords or []
        
        self.business_keywords = set(k.lower() for k in raw_keywords)
        self.min_views = min_views
        self.max_hours_old = 48  # Искать только за последние 48 часов

    def filter_content(self, raw_items: List[dict]) -> List[dict]:
        filtered = []
        current_time = time.time()
        
        print(f"🧹 Filter: Анализ {len(raw_items)} видео по тегам: {self.business_keywords}")

        for item in raw_items:
            # 1. ПРОВЕРКА КЛЮЧЕВЫХ СЛОВ (Строгий фейсконтроль)
            # Видео должно содержать хотя бы одно слово из тех, что мы искали
            text = (item.get("text") or item.get("desc") or "").lower()
            
            if self.business_keywords:
                if not any(k in text for k in self.business_keywords):
                    continue # Нет ключевого слова -> пропускаем

            # 2. ПРОВЕРКА ВРЕМЕНИ
            create_time = item.get("createTime")
            if not create_time: continue
            
            # Фикс для миллисекунд
            if create_time > 10000000000:
                create_time = create_time / 1000
            
            age_hours = (current_time - create_time) / 3600
            
            if age_hours > self.max_hours_old:
                continue # Старое видео

            # 3. ПРОВЕРКА НА ВИРУСНОСТЬ
            # Ищем stats в разных местах
            stats = item.get("stats", {})
            views = item.get("playCount") or stats.get("playCount", 0)
            
            if age_hours < 0.5: age_hours = 0.5
            velocity = views / age_hours
            
            # Логика: либо быстро набирает (100/час), либо уже много набрало (>10к)
            if velocity < 100 and views < 10000:
                continue

            item['viral_velocity'] = round(velocity, 1)
            filtered.append(item)
            
        print(f"✨ Filter: Прошло фильтр {len(filtered)} видео.")
        return filtered