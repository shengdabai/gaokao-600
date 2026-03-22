import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import WeeklyReviewOut
from app.services.ai_service import AIService
from app.services.weekly_review import WeeklyReviewService

router = APIRouter(prefix="/api", tags=["weekly_review"])

USER_ID = 1


@router.get("/weekly-review", response_model=WeeklyReviewOut)
async def get_weekly_review(db: Session = Depends(get_db)):
    svc = WeeklyReviewService(db)
    data = svc.compute_weekly_review(USER_ID)

    ai_summary = None
    if os.environ.get("GEMINI_API_KEY"):
        try:
            serializable = {
                **data,
                "week_start": str(data["week_start"]),
                "week_end": str(data["week_end"]),
            }
            ai_summary = await AIService.weekly_summary(serializable)
        except Exception:
            ai_summary = None

    return WeeklyReviewOut(
        week_start=data["week_start"],
        week_end=data["week_end"],
        total_tasks=data["total_tasks"],
        completed_tasks=data["completed_tasks"],
        completion_rate=data["completion_rate"],
        wrong_questions_reviewed=data["wrong_questions_reviewed"],
        wrong_questions_mastered=data["wrong_questions_mastered"],
        subject_breakdown=data["subject_breakdown"],
        suggestions=data["suggestions"],
        ai_summary=ai_summary,
    )
