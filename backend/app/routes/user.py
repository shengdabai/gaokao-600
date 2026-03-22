from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserProfile, UserProfileUpdate

router = APIRouter(prefix="/api/user", tags=["user"])


def _get_or_create_user(db: Session) -> User:
    """Get the default user (id=1) or create one if not exists."""
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="学生")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("/profile", response_model=UserProfile)
def get_profile(db: Session = Depends(get_db)):
    user = _get_or_create_user(db)
    return user


@router.put("/profile", response_model=UserProfile)
def update_profile(payload: UserProfileUpdate, db: Session = Depends(get_db)):
    user = _get_or_create_user(db)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
