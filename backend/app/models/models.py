import enum
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class PlanType(str, enum.Enum):
    hundred_day = "hundred_day"
    weekly = "weekly"
    daily = "daily"


class PlanStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class MasteryStatus(str, enum.Enum):
    not_mastered = "not_mastered"
    reviewing = "reviewing"
    mastered = "mastered"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, default="学生")
    target_total_score = Column(Integer, default=600)
    target_chinese = Column(Integer, default=110)
    target_math = Column(Integer, default=120)
    target_english = Column(Integer, default=110)
    target_physics = Column(Integer, default=85)
    target_chemistry = Column(Integer, default=80)
    target_politics = Column(Integer, default=85)
    schedule_json = Column(Text, nullable=True)

    exams = relationship("Exam", back_populates="user")
    plans = relationship("StudyPlan", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    wrong_questions = relationship("WrongQuestion", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_name = Column(String(200), nullable=False)
    exam_date = Column(Date, nullable=False)
    chinese_score = Column(Float, nullable=True)
    math_score = Column(Float, nullable=True)
    english_score = Column(Float, nullable=True)
    physics_score = Column(Float, nullable=True)
    chemistry_score = Column(Float, nullable=True)
    politics_score = Column(Float, nullable=True)
    total_score = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="exams")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_type = Column(Enum(PlanType), nullable=False)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=True)  # JSON string
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(PlanStatus), default=PlanStatus.active)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="plans")
    tasks = relationship("Task", back_populates="plan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(50), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, nullable=False)
    estimated_minutes = Column(Integer, default=30)
    completed = Column(Boolean, default=False)
    plan_id = Column(Integer, ForeignKey("study_plans.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="tasks")
    plan = relationship("StudyPlan", back_populates="tasks")


class WrongQuestion(Base):
    __tablename__ = "wrong_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(50), nullable=False)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)
    error_reason = Column(Text, nullable=True)
    knowledge_point = Column(String(200), nullable=True)
    mastery_status = Column(
        Enum(MasteryStatus), default=MasteryStatus.not_mastered
    )
    next_review_date = Column(Date, nullable=True)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="wrong_questions")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    review_type = Column(String(20), nullable=False)  # chinese / politics
    question_text = Column(Text, nullable=True)
    user_text = Column(Text, nullable=False)
    ai_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reviews")
