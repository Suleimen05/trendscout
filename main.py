import sys
import os

# 1. Исправляем пути, чтобы Python видел файлы рядом
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import time
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai

# Импорты наших файлов
from database import Trend, get_db_session
from src.collector import TikTokCollector
from src.filter import ViralContentFilter
from src.scorer import TrendScorer

load_dotenv()

# Настройка AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def run_analysis(keywords):
    """
    keywords: Список слов из Dashboard (например ['crypto', 'bitcoin'])
    """
    start_time = time.time()
    run_id = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    if not keywords:
        print("❌ Ошибка: Пустой список ключевых слов.")
        return

    print(f"🚀 ЗАПУСК: Ищем топ-10 для: {keywords}")

    # --- ИНИЦИАЛИЗАЦИЯ ---
    collector = TikTokCollector()
    
    # ВАЖНО: Передаем список слов в фильтр!
    # Фильтр теперь будет искать именно эти слова.
    filter_logic = ViralContentFilter(business_keywords=keywords)
    
    scorer = TrendScorer()
    db = get_db_session()

    # --- РАСЧЕТ ЛИМИТОВ (Как ты просил: всего около 30 видео) ---
    target_total_videos = 30
    # Делим 30 на количество слов. Минимум 5 видео на слово, чтобы не было совсем мало.
    limit_per_word = max(5, int(target_total_videos / len(keywords)))
    
    # Если слов много, лимит может чуть превысить 30, но это не страшно.
    print(f"📡 Шаг 1: Сбор данных. Лимит на слово: {limit_per_word}")
    
    # 1. СБОР
    raw_items = collector.collect(keywords, limit_per_keyword=limit_per_word)
    
    if not raw_items:
        print("⚠️ Ничего не найдено (Apify вернул пустоту).")
        return

    # 2. ФИЛЬТРАЦИЯ
    print(f"🧹 Шаг 2: Фильтрация {len(raw_items)} видео...")
    clean_items = filter_logic.filter_content(raw_items)
    
    if not clean_items:
        print("⚠️ Все видео отсеялись фильтром (нет свежих или популярных по этим словам).")
        return

    # 3. СОРТИРОВКА И ТОП-10
    print("🏆 Шаг 3: Выбор лучших...")
    
    # Сортируем по просмотрам (от большего к меньшему)
    clean_items.sort(
        key=lambda x: x.get("playCount") or x.get("stats", {}).get("playCount", 0), 
        reverse=True
    )

    # Берем ТОЛЬКО 10 лучших
    top_10_items = clean_items[:10]
    print(f"💎 Отобрано {len(top_10_items)} финалистов.")

    # 4. АНАЛИЗ И СОХРАНЕНИЕ
    print("🧠 Шаг 4: Анализ AI и запись в БД...")
    saved_count = 0
    
    for item in top_10_items:
        url = item.get("webVideoUrl") or item.get("video", {}).get("playAddr", "")
        
        # Проверка на дубликаты
        if db.query(Trend).filter(Trend.url == url).first():
            print(f"⏩ Пропуск (уже есть): {url}")
            continue

        text_desc = item.get("text") or item.get("desc", "")
        
        # --- AI Анализ с выводом ошибки ---
        summary = "AI Error"
        try:
            if api_key:
                prompt = f"Summarize this trend in 15 words. Text: '{text_desc}'"
                resp = model.generate_content(prompt)
                summary = resp.text.strip()
            else:
                summary = "No API Key"
                print("❌ Ошибка: Не задан GEMINI_API_KEY")
        except Exception as e:
            summary = "AI Failed"
            print(f"❌ Ошибка Gemini: {e}")
        # ----------------------------------

        # Считаем очки
        score = scorer.calculate_uts(item)
        
        # Собираем статистику
        stats_obj = item.get("stats", {})
        views = item.get("playCount") or stats_obj.get("playCount", 0)
        likes = item.get("diggCount") or stats_obj.get("diggCount", 0)
        comments = item.get("commentCount") or stats_obj.get("commentCount", 0)
        shares = item.get("shareCount") or stats_obj.get("shareCount", 0)
        
        full_stats = {
            "views": views, "likes": likes, "comments": comments, "shares": shares
        }

        # Основная тема для записи в БД (первое слово из запроса)
        topic_label = keywords[0] if keywords else "mixed"

        new_trend = Trend(
            run_id=run_id,
            vertical=topic_label, 
            platform="tiktok",
            url=url,
            description=text_desc,
            stats=full_stats,
            uts_score=score,
            ai_summary=summary
        )
        db.add(new_trend)
        saved_count += 1
        print(f"✅ Saved: {summary[:20]}... ({views} views)")

    db.commit()
    db.close()
    print(f"🏁 Готово! Сохранено {saved_count} новых трендов.")

if __name__ == "__main__":
    # Тестовый запуск, если запускаешь файл напрямую
    run_analysis(["test"])