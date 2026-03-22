from __future__ import annotations

import json
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.models import PlanStatus, PlanType, StudyPlan, Task
from app.services.score_analysis import ScoreAnalysisService

SUBJECT_CN = {
    "chinese": "语文",
    "math": "数学",
    "english": "英语",
    "physics": "物理",
    "chemistry": "化学",
    "politics": "政治",
}

# Boarding school evening study: 18:30-22:30 = 4 hours = ~4 sessions of ~50 min
# Weekday schedule: morning 07-12 (classes), afternoon 14-18 (classes),
# evening 18:30-22:30 (self-study, 4 sessions)
EVENING_SESSIONS = 4

# Weekly evening allocation rules:
# 2 sessions/week for Chinese, 2 for Politics, 1 each for Math/Physics/Chemistry weak repair,
# English daily small tasks (15 min), plus wrong-question review inserted
WEEKLY_EVENING_SLOTS = 7 * EVENING_SESSIONS  # 28 slots


class PlanGenerationService:
    def __init__(self, db: Session):
        self.db = db

    def _determine_phase(self, day_number: int) -> tuple[str, str]:
        if day_number <= 30:
            return "foundation", "基础巩固阶段"
        elif day_number <= 70:
            return "stabilization", "稳定提升阶段"
        else:
            return "sprint", "冲刺突破阶段"

    def _phase_strategy(self, phase: str, subject: str, gap: float) -> dict:
        strategies = {
            "foundation": {
                "chinese": "回归课本，梳理文言文知识点和作文素材积累，每周写1篇作文",
                "math": "夯实基础题型，整理公式和常用解题方法，确保选择填空正确率",
                "english": "每日背诵单词30个+语法专项训练，积累作文模板",
                "physics": "回归课本实验和基础概念，整理常见模型",
                "chemistry": "梳理元素周期表相关知识，整理方程式和实验流程",
                "politics": "梳理教材框架，整理核心概念和时政热点",
            },
            "stabilization": {
                "chinese": "专项训练现代文阅读和古诗文，作文审题立意强化",
                "math": "中档题专项突破，限时训练，错题归类分析",
                "english": "阅读理解和完形填空限时训练，写作专项",
                "physics": "综合题型训练，建立物理模型思维",
                "chemistry": "综合实验题和推断题专项，工业流程题训练",
                "politics": "大题答题模板训练，材料分析能力提升",
            },
            "sprint": {
                "chinese": "套卷模拟+作文冲刺，重点攻克薄弱题型",
                "math": "套卷限时模拟，查漏补缺，稳固中低档题",
                "english": "套卷模拟+高频词汇回顾+作文模板熟练",
                "physics": "套卷模拟，重点回顾错题本",
                "chemistry": "套卷模拟，回顾高频考点和错题",
                "politics": "时政热点综合复习，套卷模拟+答题规范",
            },
        }
        return {
            "strategy": strategies.get(phase, {}).get(subject, "按计划复习"),
            "focus_level": "high" if gap > 15 else ("medium" if gap > 5 else "low"),
        }

    def generate_hundred_day_plan(
        self, user_id: int, start_date: date | None = None
    ) -> StudyPlan:
        if start_date is None:
            start_date = date.today()
        end_date = start_date + timedelta(days=99)

        analysis_svc = ScoreAnalysisService(self.db)
        diagnosis = analysis_svc.diagnose(user_id)

        subject_gaps = {}
        if "subject_gaps" in diagnosis:
            for g in diagnosis["subject_gaps"]:
                subject_gaps[g["subject"]] = g

        phases = []
        for phase_key, phase_name, d_start, d_end in [
            ("foundation", "基础巩固阶段", 1, 30),
            ("stabilization", "稳定提升阶段", 31, 70),
            ("sprint", "冲刺突破阶段", 71, 100),
        ]:
            phase_content = {
                "phase": phase_key,
                "phase_name": phase_name,
                "day_range": f"第{d_start}-{d_end}天",
                "start_date": str(start_date + timedelta(days=d_start - 1)),
                "end_date": str(start_date + timedelta(days=d_end - 1)),
                "subjects": {},
            }
            for subj in SUBJECT_CN:
                gap = subject_gaps.get(subj, {}).get("gap", 0)
                strategy = self._phase_strategy(phase_key, subj, gap)
                phase_content["subjects"][subj] = {
                    "subject_cn": SUBJECT_CN[subj],
                    "gap": gap,
                    **strategy,
                }
            phases.append(phase_content)

        # Archive old hundred-day plans
        self.db.query(StudyPlan).filter(
            StudyPlan.user_id == user_id,
            StudyPlan.plan_type == PlanType.hundred_day,
            StudyPlan.status == PlanStatus.active,
        ).update({"status": PlanStatus.archived})

        plan = StudyPlan(
            user_id=user_id,
            plan_type=PlanType.hundred_day,
            title=f"百日冲刺600分计划 ({start_date} 起)",
            content=json.dumps(phases, ensure_ascii=False),
            start_date=start_date,
            end_date=end_date,
            status=PlanStatus.active,
        )
        self.db.add(plan)
        self.db.flush()

        # Generate first week's tasks
        self._generate_weekly_tasks(user_id, plan, start_date, subject_gaps)

        self.db.commit()
        self.db.refresh(plan)
        return plan

    def get_current_weekly_plan(self, user_id: int) -> StudyPlan | None:
        today = date.today()
        return (
            self.db.query(StudyPlan)
            .filter(
                StudyPlan.user_id == user_id,
                StudyPlan.plan_type == PlanType.weekly,
                StudyPlan.status == PlanStatus.active,
                StudyPlan.start_date <= today,
                StudyPlan.end_date >= today,
            )
            .first()
        )

    def generate_weekly_plan(self, user_id: int, week_start: date | None = None) -> StudyPlan:
        if week_start is None:
            today = date.today()
            # Monday of current week
            week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        # Determine which phase we are in relative to the hundred-day plan
        hundred_day = (
            self.db.query(StudyPlan)
            .filter(
                StudyPlan.user_id == user_id,
                StudyPlan.plan_type == PlanType.hundred_day,
                StudyPlan.status == PlanStatus.active,
            )
            .first()
        )

        day_number = 1
        if hundred_day:
            day_number = max(1, (week_start - hundred_day.start_date).days + 1)

        phase_key, phase_name = self._determine_phase(day_number)

        analysis_svc = ScoreAnalysisService(self.db)
        diagnosis = analysis_svc.diagnose(user_id)
        subject_gaps = {}
        if "subject_gaps" in diagnosis:
            for g in diagnosis["subject_gaps"]:
                subject_gaps[g["subject"]] = g

        # Archive old weekly plans
        self.db.query(StudyPlan).filter(
            StudyPlan.user_id == user_id,
            StudyPlan.plan_type == PlanType.weekly,
            StudyPlan.status == PlanStatus.active,
        ).update({"status": PlanStatus.archived})

        weekly_content = {
            "phase": phase_key,
            "phase_name": phase_name,
            "day_number": day_number,
            "priorities": [g["subject"] for g in diagnosis.get("subject_gaps", [])[:3]],
        }

        plan = StudyPlan(
            user_id=user_id,
            plan_type=PlanType.weekly,
            title=f"周计划 {week_start} ~ {week_end} ({phase_name})",
            content=json.dumps(weekly_content, ensure_ascii=False),
            start_date=week_start,
            end_date=week_end,
            status=PlanStatus.active,
        )
        self.db.add(plan)
        self.db.flush()

        self._generate_weekly_tasks(user_id, plan, week_start, subject_gaps)

        self.db.commit()
        self.db.refresh(plan)
        return plan

    def _generate_weekly_tasks(
        self,
        user_id: int,
        plan: StudyPlan,
        week_start: date,
        subject_gaps: dict,
    ) -> None:
        priority_subjects = sorted(
            subject_gaps.values(), key=lambda g: g.get("weighted_gap", 0), reverse=True
        )
        top_weak = [s["subject"] for s in priority_subjects[:3] if s.get("gap", 0) > 0]

        # Determine phase
        hundred_day = (
            self.db.query(StudyPlan)
            .filter(
                StudyPlan.user_id == user_id,
                StudyPlan.plan_type == PlanType.hundred_day,
                StudyPlan.status == PlanStatus.active,
            )
            .first()
        )
        day_number = 1
        if hundred_day:
            day_number = max(1, (week_start - hundred_day.start_date).days + 1)
        phase_key, _ = self._determine_phase(day_number)

        tasks_to_add: list[Task] = []

        for day_offset in range(7):
            current_date = week_start + timedelta(days=day_offset)
            is_weekend = day_offset >= 5

            # English daily small task (every day)
            tasks_to_add.append(
                Task(
                    user_id=user_id,
                    subject="english",
                    title="英语每日小任务",
                    description="背单词30个 + 1篇阅读/完形",
                    scheduled_date=current_date,
                    estimated_minutes=20,
                    plan_id=plan.id,
                )
            )

            # Wrong-question review (every day)
            tasks_to_add.append(
                Task(
                    user_id=user_id,
                    subject="review",
                    title="错题回顾",
                    description="复习今日到期的错题",
                    scheduled_date=current_date,
                    estimated_minutes=30,
                    plan_id=plan.id,
                )
            )

            # Evening session allocation by day of week (Mon=0 .. Sun=6)
            if day_offset == 0:  # Monday: Chinese
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject="chinese",
                        title=f"语文晚自习 - {self._subject_task_title(phase_key, 'chinese')}",
                        description=self._phase_strategy(
                            phase_key, "chinese", subject_gaps.get("chinese", {}).get("gap", 0)
                        )["strategy"],
                        scheduled_date=current_date,
                        estimated_minutes=100,
                        plan_id=plan.id,
                    )
                )
            elif day_offset == 1:  # Tuesday: Politics
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject="politics",
                        title=f"政治晚自习 - {self._subject_task_title(phase_key, 'politics')}",
                        description=self._phase_strategy(
                            phase_key, "politics", subject_gaps.get("politics", {}).get("gap", 0)
                        )["strategy"],
                        scheduled_date=current_date,
                        estimated_minutes=100,
                        plan_id=plan.id,
                    )
                )
            elif day_offset == 2:  # Wednesday: Weak subject repair
                weak_subj = top_weak[0] if top_weak else "math"
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject=weak_subj,
                        title=f"{SUBJECT_CN.get(weak_subj, weak_subj)}薄弱专项",
                        description=self._phase_strategy(
                            phase_key, weak_subj, subject_gaps.get(weak_subj, {}).get("gap", 0)
                        )["strategy"],
                        scheduled_date=current_date,
                        estimated_minutes=100,
                        plan_id=plan.id,
                    )
                )
            elif day_offset == 3:  # Thursday: Chinese (2nd session)
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject="chinese",
                        title=f"语文晚自习(二) - {self._subject_task_title(phase_key, 'chinese')}",
                        description="作文练习或现代文阅读专项",
                        scheduled_date=current_date,
                        estimated_minutes=100,
                        plan_id=plan.id,
                    )
                )
            elif day_offset == 4:  # Friday: Politics (2nd session)
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject="politics",
                        title=f"政治晚自习(二) - {self._subject_task_title(phase_key, 'politics')}",
                        description="大题训练或时政分析",
                        scheduled_date=current_date,
                        estimated_minutes=100,
                        plan_id=plan.id,
                    )
                )
            elif day_offset == 5:  # Saturday: Second weak subject
                weak_subj = top_weak[1] if len(top_weak) > 1 else "physics"
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject=weak_subj,
                        title=f"{SUBJECT_CN.get(weak_subj, weak_subj)}周末专项",
                        description=self._phase_strategy(
                            phase_key, weak_subj, subject_gaps.get(weak_subj, {}).get("gap", 0)
                        )["strategy"],
                        scheduled_date=current_date,
                        estimated_minutes=120,
                        plan_id=plan.id,
                    )
                )
            else:  # Sunday: Third weak subject + overall review
                weak_subj = top_weak[2] if len(top_weak) > 2 else "chemistry"
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject=weak_subj,
                        title=f"{SUBJECT_CN.get(weak_subj, weak_subj)}周末专项",
                        description=self._phase_strategy(
                            phase_key, weak_subj, subject_gaps.get(weak_subj, {}).get("gap", 0)
                        )["strategy"],
                        scheduled_date=current_date,
                        estimated_minutes=90,
                        plan_id=plan.id,
                    )
                )
                tasks_to_add.append(
                    Task(
                        user_id=user_id,
                        subject="review",
                        title="本周总结与下周规划",
                        description="回顾本周完成情况，整理错题，规划下周重点",
                        scheduled_date=current_date,
                        estimated_minutes=45,
                        plan_id=plan.id,
                    )
                )

        self.db.add_all(tasks_to_add)

    def _subject_task_title(self, phase: str, subject: str) -> str:
        titles = {
            "foundation": {"chinese": "基础梳理", "politics": "框架整理"},
            "stabilization": {"chinese": "专项突破", "politics": "模板训练"},
            "sprint": {"chinese": "模拟冲刺", "politics": "热点冲刺"},
        }
        return titles.get(phase, {}).get(subject, "专项学习")
