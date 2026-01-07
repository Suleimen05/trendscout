import pandas as pd
import streamlit as st
import time
from dotenv import load_dotenv

from database import Trend, get_db_session
# Импортируем нашу функцию запуска
from main import run_analysis 

load_dotenv()

# --- ФУНКЦИИ БАЗЫ ДАННЫХ ---
def load_runs(session):
    rows = session.query(Trend.run_id).distinct().order_by(Trend.run_id.desc()).all()
    return [r[0] for r in rows]

def fetch_data(session, selected_run):
    query = session.query(Trend)
    if selected_run and selected_run != "Все":
        query = query.filter(Trend.run_id == selected_run)
    return query.order_by(Trend.uts_score.desc()).all()

# --- ИНТЕРФЕЙС ---
def render_dashboard():
    st.set_page_config(page_title="TrendScout Flexible", page_icon="🕵️", layout="wide")
    st.title("🕵️ TrendScout — Поиск трендов")

    session = get_db_session()
    
    # === ЛЕВАЯ ПАНЕЛЬ (УПРАВЛЕНИЕ) ===
    with st.sidebar:
        st.header("⚙️ Поиск")
        
        st.info("Введите темы (каждая с новой строки):")
        
        # Поле ввода ключевых слов
        keywords_input = st.text_area(
            "Ключевые слова:",
            value="coffee\nlatte\nbarista", # Пример
            height=150,
            help="Введите слова, по которым робот будет искать видео."
        )
        
        # Кнопка запуска
        if st.button("🚀 НАЙТИ ТРЕНДЫ", type="primary"):
            # Превращаем текст в список: разделяем по переносу строки и удаляем пустые
            keywords = [k.strip() for k in keywords_input.splitlines() if k.strip()]
            
            if not keywords:
                st.error("⚠️ Введите хотя бы одно слово!")
            else:
                st.success(f"Ищем: {', '.join(keywords)}")
                with st.spinner("⏳ Робот работает... Ждите..."):
                    try:
                        # ВЫЗЫВАЕМ ФУНКЦИЮ ИЗ MAIN.PY
                        run_analysis(keywords)
                        
                        st.success("Готово! Данные обновлены.")
                        time.sleep(1) # Пауза чтобы прочитать
                        st.rerun()    # Перезагрузка страницы
                    except Exception as e:
                        st.error(f"Ошибка при запуске: {e}")

        st.divider()

        st.subheader("📂 История")
        all_runs = load_runs(session)
        options = ["Все"] + all_runs
        selected_run = st.selectbox("Показать запуск:", options=options, index=0)

        st.divider()
        if st.button("🗑️ Очистить базу"):
            session.query(Trend).delete()
            session.commit()
            st.warning("База очищена.")
            st.rerun()

    # === ЦЕНТРАЛЬНАЯ ЧАСТЬ ===
    data = fetch_data(session, selected_run)

    if not data:
        st.info("📭 Данных нет. Введите слова слева и нажмите 'Найти тренды'.")
        return

    # Метрики
    avg_score = sum(t.uts_score for t in data) / len(data) if data else 0
    max_views = max((t.stats or {}).get("views", 0) for t in data) if data else 0
    
    c1, c2, c3 = st.columns(3)
    c1.metric("Найдено видео", len(data))
    c2.metric("Макс. просмотры", f"{max_views:,}")
    c3.metric("Средний Score", f"{avg_score:.1f}")

    st.divider()
    
    # Таблица
    df = pd.DataFrame([
        {
            "Score": t.uts_score,
            "Тема": t.vertical,
            "Суть (AI)": t.ai_summary or "...",
            "Просмотры": (t.stats or {}).get('views', 0),
            "Лайки": (t.stats or {}).get('likes', 0),
            "URL": t.url,
        }
        for t in data
    ])

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Score": st.column_config.NumberColumn("UTS ⚡", format="%.1f"),
            "URL": st.column_config.LinkColumn("Ссылка на видео"),
            "Просмотры": st.column_config.NumberColumn("Views", format="%d"),
        }
    )

if __name__ == "__main__":
    render_dashboard()