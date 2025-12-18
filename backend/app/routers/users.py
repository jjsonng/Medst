from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models import User
from app.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

# Response schema for current user
class CurrentUserOut(BaseModel):
    email: str
    full_name: str
    avatar_url: str | None = None

@router.get("/me", response_model=CurrentUserOut)
def get_current_user_endpoint(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "full_name": current_user.full_name or "Unknown User",
        "avatar_url": getattr(current_user, "avatar_url", None),
    }
