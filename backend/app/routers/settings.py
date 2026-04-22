from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.setting import Setting
from ..models.user import User
from ..services.auth import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingUpdate(BaseModel):
    anthropic_api_key: Optional[str] = None


class SettingResponse(BaseModel):
    anthropic_api_key_set: bool
    github_oauth_enabled: bool


@router.get("/", response_model=SettingResponse)
def get_settings_status(db: Session = Depends(get_db)):
    from ..config import get_settings
    cfg = get_settings()

    api_key_in_db = db.query(Setting).filter(Setting.key == "anthropic_api_key").first()
    api_key_set = bool(api_key_in_db) or bool(cfg.anthropic_api_key)
    github_enabled = bool(cfg.github_client_id and cfg.github_client_secret)

    return SettingResponse(
        anthropic_api_key_set=api_key_set,
        github_oauth_enabled=github_enabled,
    )


@router.post("/")
def update_settings(
    data: SettingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.anthropic_api_key is not None:
        setting = db.query(Setting).filter(Setting.key == "anthropic_api_key").first()
        if setting:
            setting.value = data.anthropic_api_key
        else:
            db.add(Setting(key="anthropic_api_key", value=data.anthropic_api_key))
        db.commit()

        # Reset Claude client so it picks up the new key
        from ..services import claude as claude_svc
        claude_svc._client = None

    return {"ok": True}
