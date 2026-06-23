from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import DEFAULT_USER_ID
from app.database import get_db
from app.schemas.schemas import PlanGenerateRequest, PlanOut
from app.services.plan_generation import PlanGenerationService

router = APIRouter(prefix="/api/plan", tags=["plan"])

USER_ID = DEFAULT_USER_ID


@router.post("/generate", response_model=PlanOut)
def generate_plan(payload: PlanGenerateRequest, db: Session = Depends(get_db)):
    svc = PlanGenerationService(db)
    plan = svc.generate_hundred_day_plan(USER_ID, start_date=payload.start_date)
    return plan


@router.get("/weekly", response_model=PlanOut)
def get_weekly_plan(db: Session = Depends(get_db)):
    svc = PlanGenerationService(db)
    plan = svc.get_current_weekly_plan(USER_ID)
    if plan:
        return plan
    plan = svc.generate_weekly_plan(USER_ID)
    return plan
