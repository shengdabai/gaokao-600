from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import (
    ai_review_router,
    exam_router,
    plan_router,
    task_router,
    user_router,
    weekly_review_router,
    wrong_question_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="高考冲刺600分百日计划",
    description="AI-powered Gaokao 600-point 100-day study booster backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(exam_router)
app.include_router(plan_router)
app.include_router(task_router)
app.include_router(wrong_question_router)
app.include_router(ai_review_router)
app.include_router(weekly_review_router)


@app.get("/")
def root():
    return {"message": "高考冲刺600分百日计划 API", "version": "1.0.0"}
