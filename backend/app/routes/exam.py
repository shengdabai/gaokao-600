from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Exam, User
from app.schemas.schemas import ExamCreate, ExamOut
from app.services.score_analysis import ScoreAnalysisService

router = APIRouter(prefix="/api", tags=["exam"])

USER_ID = 1


def _ensure_user(db: Session) -> None:
    user = db.query(User).filter(User.id == USER_ID).first()
    if not user:
        db.add(User(id=USER_ID, name="学生"))
        db.commit()


@router.post("/exams", response_model=ExamOut)
def create_exam(payload: ExamCreate, db: Session = Depends(get_db)):
    _ensure_user(db)
    scores = {
        "chinese_score": payload.chinese_score,
        "math_score": payload.math_score,
        "english_score": payload.english_score,
        "physics_score": payload.physics_score,
        "chemistry_score": payload.chemistry_score,
        "politics_score": payload.politics_score,
    }
    total = sum(v for v in scores.values() if v is not None)

    exam = Exam(
        user_id=USER_ID,
        exam_name=payload.exam_name,
        exam_date=payload.exam_date,
        total_score=total,
        **scores,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


@router.get("/exams", response_model=List[ExamOut])
def list_exams(db: Session = Depends(get_db)):
    return (
        db.query(Exam)
        .filter(Exam.user_id == USER_ID)
        .order_by(Exam.exam_date.desc())
        .all()
    )


@router.delete("/exams/{exam_id}")
def delete_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == USER_ID).first()
    if not exam:
        raise HTTPException(status_code=404, detail="考试记录不存在")
    db.delete(exam)
    db.commit()
    return {"detail": "删除成功"}


@router.get("/diagnosis")
def get_diagnosis(db: Session = Depends(get_db)):
    svc = ScoreAnalysisService(db)
    result = svc.diagnose(USER_ID)
    if "error" in result:
        return {"error": result["error"]}
    return result
