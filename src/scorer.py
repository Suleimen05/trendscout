class TrendScorer:
    def __init__(self):
        pass

    def calculate_uts(self, item: dict) -> float:
        """Calculate Universal Trend Score."""
        stats = item.get("stats") or {}
        views = max(stats.get("playCount", 0), 1)
        likes = stats.get("diggCount", 0)
        comments = stats.get("commentCount", 0)
        shares = stats.get("shareCount", 0)

        engagement_rate = (likes + comments * 2 + shares * 5) / views

        velocity = 1.0
        if views > 100_000:
            velocity = 1.3
        elif views > 50_000:
            velocity = 1.15

        group_size = item.get("_group_size", 1)
        group_bonus = 1 + 0.05 * max(group_size - 1, 0)

        score = engagement_rate * velocity * group_bonus * 1000
        return round(score, 2)
