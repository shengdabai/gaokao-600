from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── User ──────────────────────────────────────────────────────────────
class UserProfile(BaseModel):
    id: int
    name: str
    target_total_score: int
    target_chinese: int
    target_math: int
    target_english: int
    target_physics: int
    target_chemistry: int
    target_politics: int
    schedule_json: Optional[str] = None

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    target_total_score: Optional[int] = None
    target_chinese: Optional[int] = None
    target_math: Optional[int] = None
    target_english: Optional[int] = None
    target_physics: Optional[int] = None
    target_chemistry: Optional[int] = None
    target_politics: Optional[int] = None
    schedule_json: Optional[str] = None


# ── Exam ──────────────────────────────────────────────────────────────
class ExamCreate(BaseModel):
    exam_name: str
    exam_date: date
    chinese_score: Optional[float] = None
    math_score: Optional[float] = None
    english_score: Optional[float] = None
    physics_score: Optional[float] = None
    chemistry_score: Optional[float] = None
    politics_score: Optional[float] = None


class ExamOut(BaseModel):
    id: int
    user_id: int
    exam_name: str
    exam_date: date
    chinese_score: Optional[float] = None
    math_score: Optional[float] = None
    english_score: Optional[float] = None
    physics_score: Optional[float] = None
    chemistry_score: Optional[float] = None
    politics_score: Optional[float] = None
    total_score: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Diagnosis ─────────────────────────────────────────────────────────
class SubjectGap(BaseModel):
    subject: str
    subject_cn: str
    current: float
    target: int
    gap: float
    weighted_gap: float
    priority_rank: int


class DiagnosisResult(BaseModel):
    total_current: float
    total_target: int
    total_gap: float
    subject_gaps: List[SubjectGap]


# ── Plan ──────────────────────────────────────────────────────────────
class PlanGenerateRequest(BaseModel):
    start_date: Optional[date] = None  # defaults to today


class PlanOut(BaseModel):
    id: int
    user_id: int
    plan_type: str
    title: str
    content: Optional[str] = None
    start_date: date
    end_date: date
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Task ──────────────────────────────────────────────────────────────
class TaskOut(BaseModel):
    id: int
    user_id: int
    subject: str
    title: str
    description: Optional[str] = None
    scheduled_date: date
    estimated_minutes: int
    completed: bool
    plan_id: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Wrong Question ───────────────────────────────────────────────────
class WrongQuestionCreate(BaseModel):
    subject: str
    question_text: str
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    error_reason: Optional[str] = None
    knowledge_point: Optional[str] = None


class WrongQuestionUpdate(BaseModel):
    mastery_status: Optional[str] = None
    error_reason: Optional[str] = None
    knowledge_point: Optional[str] = None
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None


class WrongQuestionOut(BaseModel):
    id: int
    user_id: int
    subject: str
    question_text: str
    user_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    error_reason: Optional[str] = None
    knowledge_point: Optional[str] = None
    mastery_status: str
    next_review_date: Optional[date] = None
    review_count: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── AI Review ────────────────────────────────────────────────────────
class ChineseReviewRequest(BaseModel):
    text: str


class PoliticsReviewRequest(BaseModel):
    question: str
    answer: str


class ImageAnalyzeRequest(BaseModel):
    base64_image: str
    subject: str = "general"


class SearchNotesRequest(BaseModel):
    query: str
    subject: str = "general"


class AIReviewResponse(BaseModel):
    feedback: str


# ── Weekly Review ────────────────────────────────────────────────────
class WeeklyReviewOut(BaseModel):
    week_start: date
    week_end: date
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    wrong_questions_reviewed: int
    wrong_questions_mastered: int
    subject_breakdown: Dict[str, Any]
    suggestions: List[str]
    ai_summary: Optional[str] = None
