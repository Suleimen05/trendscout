"""
AI Insights endpoint - Gemini-powered recommendations for users.

This endpoint analyzes user's connected accounts and video data
to provide personalized, actionable insights WITHOUT requiring user input.

Features:
- Auto-generated insights (no chat interface)
- Analyzes video performance across platforms
- Returns 3 actionable recommendations
- Secure: only processes user's own data
"""
import os
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ...core.database import get_db
from ...db.models import User, UserAccount, SocialPlatform
from ..dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Insights"])


# =============================================================================
# SCHEMAS
# =============================================================================

class InsightItem(BaseModel):
    """Single insight/recommendation."""
    type: str  # "timing", "content", "growth", "engagement"
    icon: str  # emoji for frontend
    title: str  # Short title
    description: str  # Detailed recommendation
    priority: str  # "high", "medium", "low"


class InsightsResponse(BaseModel):
    """AI Insights response."""
    insights: List[InsightItem]
    generated_at: str
    data_sources: List[str]  # Which platforms were analyzed
    message: Optional[str] = None


class AccountStats(BaseModel):
    """Stats from a connected account."""
    platform: str
    username: str
    followers: int
    total_views: int
    total_posts: int
    avg_views: float
    engagement_rate: float
    recent_posts: List[dict]


# =============================================================================
# GEMINI CLIENT
# =============================================================================

def get_gemini_insights(user_data: dict) -> List[InsightItem]:
    """
    Call Gemini API to generate insights based on user data.

    Args:
        user_data: Dict with user's account stats and video data

    Returns:
        List of InsightItem recommendations
    """
    try:
        from google import genai

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.warning("Gemini API key not configured, using fallback insights")
            return get_fallback_insights(user_data)

        # Initialize Gemini client
        client = genai.Client(api_key=api_key)

        # Build prompt with user's data
        prompt = build_insights_prompt(user_data)

        # Call Gemini
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        # Parse response into InsightItems
        insights = parse_gemini_response(response.text)

        if not insights:
            return get_fallback_insights(user_data)

        return insights

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return get_fallback_insights(user_data)


def build_insights_prompt(user_data: dict) -> str:
    """Build the prompt for Gemini with user's data."""

    accounts_summary = ""
    for acc in user_data.get("accounts", []):
        accounts_summary += f"""
Platform: {acc['platform']}
Username: @{acc['username']}
Followers: {acc['followers']:,}
Total Posts: {acc['total_posts']}
Avg Views: {acc['avg_views']:,.0f}
Engagement Rate: {acc['engagement_rate']:.2f}%
"""

        if acc.get('recent_posts'):
            accounts_summary += "Recent posts performance:\n"
            for post in acc['recent_posts'][:5]:
                views = post.get('views', 0)
                likes = post.get('likes', 0)
                accounts_summary += f"  - Views: {views:,}, Likes: {likes:,}\n"

    if not accounts_summary:
        accounts_summary = "No connected accounts yet."

    prompt = f"""You are a social media growth expert. Analyze this creator's data and provide exactly 3 actionable insights.

USER DATA:
{accounts_summary}

INSTRUCTIONS:
1. Analyze the data and identify patterns
2. Provide 3 specific, actionable recommendations
3. Focus on: posting timing, content strategy, and growth opportunities
4. Be specific and data-driven

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (one insight per line):
INSIGHT|type|icon|title|description|priority

Where:
- type: one of "timing", "content", "growth", "engagement"
- icon: relevant emoji (📊, ⏰, 🎯, 📈, 💡, 🔥)
- title: short title (max 50 chars)
- description: actionable advice (max 200 chars)
- priority: "high", "medium", or "low"

Example:
INSIGHT|timing|⏰|Post at Peak Hours|Your audience is most active 6-9 PM. Schedule posts during this window for 40% more reach.|high
INSIGHT|content|🎯|Use Trending Sounds|Videos with trending audio get 2x more views. Check TikTok's sound library weekly.|medium
INSIGHT|growth|📈|Engage More|Reply to comments within 1 hour. This boosts algorithm visibility by 25%.|high

RESPOND WITH EXACTLY 3 INSIGHTS:"""

    return prompt


def parse_gemini_response(response_text: str) -> List[InsightItem]:
    """Parse Gemini response into InsightItems."""
    insights = []

    lines = response_text.strip().split('\n')

    for line in lines:
        line = line.strip()
        if not line.startswith('INSIGHT|'):
            continue

        parts = line.split('|')
        if len(parts) < 6:
            continue

        try:
            _, insight_type, icon, title, description, priority = parts[:6]
            insights.append(InsightItem(
                type=insight_type.strip().lower(),
                icon=icon.strip(),
                title=title.strip(),
                description=description.strip(),
                priority=priority.strip().lower()
            ))
        except Exception as e:
            logger.warning(f"Failed to parse insight line: {line}, error: {e}")
            continue

    return insights[:3]  # Return max 3 insights


def get_fallback_insights(user_data: dict) -> List[InsightItem]:
    """Generate fallback insights when Gemini is unavailable."""

    accounts = user_data.get("accounts", [])

    insights = []

    # Insight 1: Based on connected accounts
    if not accounts:
        insights.append(InsightItem(
            type="growth",
            icon="🔗",
            title="Connect Your Accounts",
            description="Link your TikTok, Instagram, or YouTube to get personalized insights based on your actual performance data.",
            priority="high"
        ))
    else:
        # Find lowest engagement
        lowest_eng = min(accounts, key=lambda x: x.get('engagement_rate', 0))
        insights.append(InsightItem(
            type="engagement",
            icon="💬",
            title=f"Boost {lowest_eng['platform'].title()} Engagement",
            description=f"Your {lowest_eng['platform'].title()} engagement is {lowest_eng.get('engagement_rate', 0):.1f}%. Try asking questions in captions to encourage comments.",
            priority="high"
        ))

    # Insight 2: Posting consistency
    insights.append(InsightItem(
        type="timing",
        icon="⏰",
        title="Optimize Posting Time",
        description="Post consistently between 6-9 PM local time when your audience is most active. Consistency builds algorithmic trust.",
        priority="medium"
    ))

    # Insight 3: Content strategy
    insights.append(InsightItem(
        type="content",
        icon="🎯",
        title="Hook Viewers in 3 Seconds",
        description="The first 3 seconds determine if viewers stay. Start with movement, text hooks, or surprising visuals.",
        priority="high"
    ))

    return insights[:3]


# =============================================================================
# ENDPOINT
# =============================================================================

@router.get("/", response_model=InsightsResponse)
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated insights for the authenticated user.

    Analyzes user's connected accounts and video performance
    to provide personalized, actionable recommendations.

    Returns:
        InsightsResponse with 3 insights and metadata
    """
    logger.info(f"Generating insights for user {current_user.id}")

    # Fetch user's connected accounts
    accounts = db.query(UserAccount).filter(
        UserAccount.user_id == current_user.id,
        UserAccount.is_active == True
    ).all()

    # Build user data dict for Gemini
    user_data = {
        "user_id": current_user.id,
        "accounts": []
    }

    data_sources = []

    for acc in accounts:
        account_data = {
            "platform": acc.platform.value,
            "username": acc.username,
            "followers": acc.followers_count or 0,
            "total_posts": acc.total_posts or 0,
            "total_views": acc.total_views or 0,
            "avg_views": acc.avg_views or 0,
            "engagement_rate": acc.engagement_rate or 0,
            "recent_posts": acc.recent_posts or []
        }
        user_data["accounts"].append(account_data)
        data_sources.append(acc.platform.value)

    # Generate insights
    insights = get_gemini_insights(user_data)

    return InsightsResponse(
        insights=insights,
        generated_at=datetime.utcnow().isoformat(),
        data_sources=data_sources if data_sources else ["general"],
        message="Insights generated based on your connected accounts" if data_sources else "Connect your accounts for personalized insights"
    )


@router.get("/refresh", response_model=InsightsResponse)
async def refresh_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Force refresh insights (same as GET / but explicitly named).
    """
    return await get_ai_insights(current_user, db)
