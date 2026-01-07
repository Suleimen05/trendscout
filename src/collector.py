import os
from typing import List
from apify_client import ApifyClient

class TikTokCollector:
    def __init__(self):
        token = os.getenv("APIFY_API_TOKEN")
        if not token:
            # Если токена нет, код не упадет сразу, но выдаст ошибку при запуске
            print("⚠️ WARNING: APIFY_API_TOKEN not found in .env")
            self.client = None
        else:
            self.client = ApifyClient(token)

    def collect(self, keywords: List[str], limit_per_keyword: int = 20):
        """
        Скачивает данные из TikTok по списку слов.
        """
        if not self.client:
            print("❌ Ошибка: Нет API токена Apify.")
            return []

        if not keywords:
            return []

        print(f"📡 Collector: Запрос Apify для {len(keywords)} слов. Лимит на слово: {limit_per_keyword}")

        # Рассчитываем общий лимит
        total_max_items = len(keywords) * limit_per_keyword

        run_input = {
            "searchQueries": keywords,
            "resultsPerPage": limit_per_keyword,
            "maxItems": total_max_items,
            "scrapeComments": False,
            "scrapeDescriptions": True,
        }

        try:
            # Запускаем актора
            actor = self.client.actor("clockworks/tiktok-scraper")
            run = actor.call(run_input=run_input)
            
            if not run:
                print("⚠️ Apify вернул пустой результат.")
                return []

            # Забираем результаты
            dataset = self.client.dataset(run["defaultDatasetId"])
            items = list(dataset.iterate_items())
            
            print(f"✅ Collector: Скачано {len(items)} сырых видео.")
            return items

        except Exception as exc:
            print(f"⚠️ Критическая ошибка Apify: {exc}")
            return []