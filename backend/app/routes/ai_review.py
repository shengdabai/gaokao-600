from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import DEFAULT_USER_ID
from app.database import get_db
from app.models.models import Review
from app.schemas.schemas import (
    AIReviewResponse,
    CheckAnswerRequest,
    ChineseReviewRequest,
    EnglishReviewRequest,
    ImageAnalyzeRequest,
    PoliticsReviewRequest,
    RecognizeQuestionRequest,
    RecognizeQuestionResponse,
    SearchNotesRequest,
    SimilarQuestionsRequest,
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["ai"])

USER_ID = DEFAULT_USER_ID


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


@router.post("/recognize-question", response_model=RecognizeQuestionResponse)
async def recognize_question(payload: RecognizeQuestionRequest):
    result = await AIService.recognize_question(payload.base64_image, payload.subject)
    if "error" in result:
        # Model returned unparseable output; respond with a clear 422
        # instead of a 500 from response-model validation.
        raise HTTPException(status_code=422, detail=result["error"])
    return RecognizeQuestionResponse(**result)


@router.post("/similar-questions", response_model=AIReviewResponse)
async def similar_questions(payload: SimilarQuestionsRequest):
    feedback = await AIService.generate_similar(
        payload.question_text, payload.subject, payload.knowledge_point, payload.error_reason
    )
    return AIReviewResponse(feedback=feedback)


@router.post("/check-answer", response_model=AIReviewResponse)
async def check_answer(payload: CheckAnswerRequest):
    feedback = await AIService.check_answer(payload.question, payload.subject, payload.user_answer)
    return AIReviewResponse(feedback=feedback)


@router.post("/english-review", response_model=AIReviewResponse)
async def english_review(payload: EnglishReviewRequest, db: Session = Depends(get_db)):
    feedback = await AIService.english_review(payload.text)
    review = Review(
        user_id=USER_ID,
        review_type="english",
        user_text=payload.text,
        ai_feedback=feedback,
    )
    db.add(review)
    db.commit()
    return AIReviewResponse(feedback=feedback)
