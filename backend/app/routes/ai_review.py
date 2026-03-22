from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Review
from app.schemas.schemas import (
    AIReviewResponse,
    ChineseReviewRequest,
    ImageAnalyzeRequest,
    PoliticsReviewRequest,
    SearchNotesRequest,
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["ai"])

USER_ID = 1


@router.post("/chinese-review", response_model=AIReviewResponse)
async def chinese_review(payload: ChineseReviewRequest, db: Session = Depends(get_db)):
    feedback = await AIService.chinese_review(payload.text)
    review = Review(
        user_id=USER_ID,
        review_type="chinese",
        user_text=payload.text,
        ai_feedback=feedback,
    )
    db.add(review)
    db.commit()
    return AIReviewResponse(feedback=feedback)


@router.post("/politics-review", response_model=AIReviewResponse)
async def politics_review(payload: PoliticsReviewRequest, db: Session = Depends(get_db)):
    feedback = await AIService.politics_review(payload.question, payload.answer)
    review = Review(
        user_id=USER_ID,
        review_type="politics",
        question_text=payload.question,
        user_text=payload.answer,
        ai_feedback=feedback,
    )
    db.add(review)
    db.commit()
    return AIReviewResponse(feedback=feedback)


@router.post("/analyze-image", response_model=AIReviewResponse)
async def analyze_image(payload: ImageAnalyzeRequest):
    feedback = await AIService.analyze_image(payload.base64_image, payload.subject)
    return AIReviewResponse(feedback=feedback)


@router.post("/search-notes", response_model=AIReviewResponse)
async def search_notes(payload: SearchNotesRequest):
    feedback = await AIService.search_notes(payload.query, payload.subject)
    return AIReviewResponse(feedback=feedback)
