from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.models import MasteryStatus, Task, WrongQuestion

SUBJECT_CN = {
    "chinese": "语文",
    "math": "数学",
    "english": "英语",
    "physics": "物理",
    "chemistry": "化学",
    "politics": "政治",
    "review": "复习",
}


class WeeklyReviewService:
    def __init__(self, db: Session):
        self.db = db

    def compute_weekly_review(self, user_id: int, week_start: date | None = None) -> dict:
        if week_start is None:
            today = date.today()
            week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        # Task completion stats
        tasks = (
            self.db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.scheduled_date >= week_start,
                Task.scheduled_date <= week_end,
            )
            .all()
        )

        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t.completed)
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0

        # Subject breakdown
        subject_breakdown: dict[str, dict] = {}
        for t in tasks:
            subj = t.subject
            if subj not in subject_breakdown:
                subject_breakdown[subj] = {
                    "subject_cn": SUBJECT_CN.get(subj, subj),
                    "total": 0,
                    "completed": 0,
                    "total_minutes": 0,
                }
            subject_breakdown[subj]["total"] += 1
            subject_breakdown[subj]["total_minutes"] += t.estimated_minutes
            if t.completed:
                subject_breakdown[subj]["completed"] += 1

        # Wrong-question review progress for the week
        wrong_questions_this_week = (
            self.db.query(WrongQuestion)
            .filter(
                WrongQuestion.user_id == user_id,
                WrongQuestion.next_review_date >= week_start,
                WrongQuestion.next_review_date <= week_end,
            )
            .all()
        )
        wq_reviewed = sum(
            1 for wq in wrong_questions_this_week if wq.review_count > 0
        )
        wq_mastered = sum(
            1
            for wq in wrong_questions_this_week
            if wq.mastery_status == MasteryStatus.mastered
        )

        # Generate suggestions based on data
        suggestions = self._generate_suggestions(
            completion_rate, subject_breakdown, wq_reviewed, len(wrong_questions_this_week)
        )

        return {
            "week_start": week_start,
            "week_end": week_end,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 1),
            "wrong_questions_reviewed": wq_reviewed,
            "wrong_questions_mastered": wq_mastered,
            "subject_breakdown": subject_breakdown,
            "suggestions": suggestions,
        }

    def _generate_suggestions(
        self,
        completion_rate: float,
        subject_breakdown: dict,
        wq_reviewed: int,
        wq_total: int,
    ) -> list[str]:
        suggestions: list[str] = []

        if completion_rate < 60:
            suggestions.append("本周任务完成率偏低，建议适当减少每日任务量，确保核心任务优先完成。")
        elif completion_rate < 80:
            suggestions.append("任务完成率尚可，继续保持节奏，尝试提高到85%以上。")
        else:
            suggestions.append("本周任务完成情况优秀，继续保持！")

        # Find worst-performing subject
        worst_subject = None
        worst_rate = 1.0
        for subj, info in subject_breakdown.items():
            if subj == "review":
                continue
            rate = info["completed"] / info["total"] if info["total"] > 0 else 1.0
            if rate < worst_rate:
                worst_rate = rate
                worst_subject = subj

        if worst_subject and worst_rate < 0.5:
            cn_name = SUBJECT_CN.get(worst_subject, worst_subject)
            suggestions.append(f"{cn_name}的任务完成率最低，下周需要重点关注，可以调整难度或拆分任务。")

        if wq_total > 0:
            wq_rate = wq_reviewed / wq_total
            if wq_rate < 0.5:
                suggestions.append("错题复习进度偏慢，建议每天固定15分钟回顾到期错题。")
        else:
            suggestions.append("本周没有待复习错题，建议及时录入练习中的错题。")

        return suggestions
