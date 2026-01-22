"""
AI Script Generation API
Generates viral TikTok scripts using Google Gemini Flash
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from ..services.gemini_script_generator import GeminiScriptGenerator

router = APIRouter()

# Инициализируем генератор
script_generator = GeminiScriptGenerator()


class ScriptRequest(BaseModel):
    """Запрос на генерацию скрипта"""
    video_description: str = Field(..., description="Описание видео")
    video_stats: Dict[str, int] = Field(
        default={
            "playCount": 0,
            "diggCount": 0,
            "commentCount": 0,
            "shareCount": 0
        },
        description="Статистика видео"
    )
    tone: str = Field(default="engaging", description="Тон скрипта: engaging, educational, humorous, inspirational")
    niche: str = Field(default="general", description="Ниша контента")
    duration_seconds: int = Field(default=30, ge=10, le=180, description="Длительность в секундах")


class ScriptResponse(BaseModel):
    """Ответ с сгенерированным скриптом"""
    hook: str
    body: list[str]
    cta: str
    viralElements: list[str]
    tips: list[str]
    duration: int
    generatedAt: str
    fallback: Optional[bool] = None


@router.post("/generate")
def generate_script(request: ScriptRequest) -> ScriptResponse:
    """
    Генерирует вирусный скрипт для TikTok видео

    - **video_description**: Описание оригинального видео
    - **video_stats**: Статистика (views, likes, comments, shares)
    - **tone**: Тон скрипта (engaging, educational, humorous, inspirational)
    - **niche**: Ниша контента
    - **duration_seconds**: Длительность видео
    """
    try:
        script = script_generator.generate_script(
            video_description=request.video_description,
            video_stats=request.video_stats,
            tone=request.tone,
            niche=request.niche,
            duration_seconds=request.duration_seconds
        )

        if not script:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate script"
            )

        return ScriptResponse(**script)

    except Exception as e:
        print(f"❌ Script generation API error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Script generation failed: {str(e)}"
        )


@router.get("/health")
def health_check():
    """Проверка работы AI Script Generator"""
    return {
        "status": "ok",
        "service": "AI Script Generator",
        "model": "Google Gemini Flash",
        "available": script_generator.client is not None
    }
