from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.models import MasteryStatus, WrongQuestion

# Spaced repetition intervals in days
REVIEW_INTERVALS = [1, 2, 4, 7, 15]


class WrongQuestionScheduler:
    def __init__(self, db: Session):
        self.db = db

    def schedule_new_question(self, question: WrongQuestion) -> WrongQuestion:
        """Set initial review date for a newly added wrong question."""
        question.mastery_status = MasteryStatus.not_mastered
        question.review_count = 0
        question.next_review_date = date.today() + timedelta(days=REVIEW_INTERVALS[0])
        return question

    def mark_reviewed(self, question: WrongQuestion, mastered: bool) -> WrongQuestion:
        """Update review schedule after a review session."""
        if mastered:
            question.review_count += 1
            if question.review_count >= len(REVIEW_INTERVALS):
                # Fully mastered after completing all intervals
                question.mastery_status = MasteryStatus.mastered
                question.next_review_date = None
            else:
                question.mastery_status = MasteryStatus.reviewing
                interval = REVIEW_INTERVALS[
                    min(question.review_count, len(REVIEW_INTERVALS) - 1)
                ]
                question.next_review_date = date.today() + timedelta(days=interval)
        else:
            # Not mastered: reset to short cycle
            question.mastery_status = MasteryStatus.not_mastered
            question.review_count = max(0, question.review_count - 1)
            question.next_review_date = date.today() + timedelta(days=REVIEW_INTERVALS[0])

        return question

    def get_due_questions(self, user_id: int, target_date: date | None = None) -> list[WrongQuestion]:
        """Get all questions due for review on a given date."""
        if target_date is None:
            target_date = date.today()
        return (
            self.db.query(WrongQuestion)
            .filter(
                WrongQuestion.user_id == user_id,
                WrongQuestion.next_review_date <= target_date,
                WrongQuestion.mastery_status != MasteryStatus.mastered,
            )
            .order_by(WrongQuestion.next_review_date.asc())
            .all()
        )

    def get_subject_stats(self, user_id: int) -> dict[str, dict]:
        """Get wrong question stats grouped by subject."""
        questions = (
            self.db.query(WrongQuestion)
            .filter(WrongQuestion.user_id == user_id)
            .all()
        )
        stats: dict[str, dict] = {}
        for q in questions:
            if q.subject not in stats:
                stats[q.subject] = {
                    "total": 0,
                    "not_mastered": 0,
                    "reviewing": 0,
                    "mastered": 0,
                }
            stats[q.subject]["total"] += 1
            stats[q.subject][q.mastery_status.value] += 1
        return stats
