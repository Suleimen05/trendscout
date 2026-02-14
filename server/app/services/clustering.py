# backend/app/services/clustering.py
import numpy as np
from sklearn.cluster import DBSCAN
from .ml_client import get_ml_client

def cluster_trends_by_visuals(trends_list: list) -> list:
    """
    Принимает список объектов Trend.
    Генерирует embeddings через ML Service и группирует по визуальному сходству.
    """
    # 1. Получаем ML client
    ml_client = get_ml_client()

    # 2. Собираем URL обложек для генерации embeddings
    trends_with_covers = [t for t in trends_list if t.cover_url]

    if not trends_with_covers:
        print("[WARNING] No trends with cover images to cluster")
        return trends_list

    # 3. Генерируем embeddings через ML сервис (batch)
    print(f"[IMAGE] Generating embeddings for {len(trends_with_covers)} cover images...")
    cover_urls = [t.cover_url for t in trends_with_covers]
    embeddings = ml_client.get_batch_image_embeddings(cover_urls)

    # 4. Присваиваем embeddings к объектам Trend
    valid_trends = []
    for i, trend in enumerate(trends_with_covers):
        if embeddings[i] is not None:
            trend.embedding = embeddings[i]
            valid_trends.append(trend)

    if not valid_trends:
        print("[WARNING] No valid embeddings generated")
        return trends_list

    try:
        # 5. Превращаем список векторов в матрицу numpy
        X = np.array([t.embedding for t in valid_trends])

        # 6. Запускаем DBSCAN
        # eps=0.15 - насколько похожи должны быть картинки (0.0 - копии, 1.0 - разные)
        # min_samples=2 - минимальное кол-во видео, чтобы считать это группой
        clustering = DBSCAN(eps=0.15, min_samples=2, metric='cosine').fit(X)

        labels = clustering.labels_ # Список типа [0, 0, 1, -1, 1 ...]

        # 7. Присваиваем ID кластеров обратно объектам
        for i, trend in enumerate(valid_trends):
            # -1 означает "шум" (уникальное видео, ни на что не похоже)
            trend.cluster_id = int(labels[i])

        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        print(f"[CLUSTER] Visual Clustering: Found {n_clusters} visual groups among {len(valid_trends)} videos.")

    except Exception as e:
        print(f"[WARNING] Clustering error: {e}")

    return trends_list