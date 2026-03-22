from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.models import Exam, User

SUBJECT_KEYS = [
    ("chinese", "语文"),
    ("math", "数学"),
    ("english", "英语"),
    ("physics", "物理"),
    ("chemistry", "化学"),
    ("politics", "政治"),
]

# Weight boosts: Chinese 1.2x, Politics 1.1x, others 1.0x
WEIGHT_BOOST: dict[str, float] = {
    "chinese": 1.2,
    "math": 1.0,
    "english": 1.0,
    "physics": 1.0,
    "chemistry": 1.0,
    "politics": 1.1,
}


@dataclass
class SubjectGapInfo:
    subject: str
    subject_cn: str
    current: float
    target: int
    gap: float
    weighted_gap: float
    priority_rank: int = 0


class ScoreAnalysisService:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_exam(self, user_id: int) -> Exam | None:
        return (
            self.db.query(Exam)
            .filter(Exam.user_id == user_id)
            .order_by(Exam.exam_date.desc(), Exam.id.desc())
            .first()
        )

    def diagnose(self, user_id: int) -> dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "用户不存在"}

        exam = self.get_latest_exam(user_id)
        if not exam:
            return {"error": "暂无考试记录，请先录入成绩"}

        gaps: list[SubjectGapInfo] = []
        total_current = 0.0
        total_target = user.target_total_score

        for key, cn_name in SUBJECT_KEYS:
            current = getattr(exam, f"{key}_score", None) or 0.0
            target = getattr(user, f"target_{key}", 0)
            gap = target - current
            weighted_gap = gap * WEIGHT_BOOST.get(key, 1.0)
            total_current += current
            gaps.append(
                SubjectGapInfo(
                    subject=key,
                    subject_cn=cn_name,
                    current=current,
                    target=target,
                    gap=gap,
                    weighted_gap=weighted_gap,
                )
            )

        # Rank by weighted_gap descending (larger gap = higher priority)
        gaps.sort(key=lambda g: g.weighted_gap, reverse=True)
        for rank, g in enumerate(gaps, start=1):
            g.priority_rank = rank

        total_gap = total_target - total_current

        return {
            "total_current": total_current,
            "total_target": total_target,
            "total_gap": total_gap,
            "subject_gaps": [
                {
                    "subject": g.subject,
                    "subject_cn": g.subject_cn,
                    "current": g.current,
                    "target": g.target,
                    "gap": g.gap,
                    "weighted_gap": g.weighted_gap,
                    "priority_rank": g.priority_rank,
                }
                for g in gaps
            ],
        }

    def get_priority_subjects(self, user_id: int) -> list[str]:
        result = self.diagnose(user_id)
        if "error" in result:
            return []
        return [g["subject"] for g in result["subject_gaps"]]
