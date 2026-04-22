from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
import httpx
import secrets

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, Token
from ..services.auth import hash_password, verify_password, create_access_token, get_current_user
from ..config import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


# ── Standard auth ────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not user.hashed_password or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(
        {"sub": str(user.id)},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Shared helper ─────────────────────────────────────────────────────────────

def _find_or_create_oauth_user(
    db: Session,
    *,
    oauth_uid: str,      # e.g. "github:12345" or "google:67890"
    email: str,
    display_name: str,
    avatar: str | None,
) -> User:
    user = db.query(User).filter(User.github_id == oauth_uid).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.github_id = oauth_uid
            user.avatar_url = avatar
        else:
            base = "".join(c if c.isalnum() else "_" for c in display_name).lower()[:20]
            username = base
            if db.query(User).filter(User.username == username).first():
                username = f"{base}_{secrets.token_hex(3)}"
            user = User(email=email, username=username, github_id=oauth_uid, avatar_url=avatar)
            db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _make_token(user: User) -> dict:
    token = create_access_token(
        {"sub": str(user.id)},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {"access_token": token, "token_type": "bearer"}


# ── GitHub OAuth ──────────────────────────────────────────────────────────────

class GitHubCallbackRequest(BaseModel):
    code: str


@router.get("/github/config")
def github_config():
    if not settings.github_client_id:
        return {"enabled": False}
    return {"enabled": True, "client_id": settings.github_client_id}


@router.post("/github", response_model=Token)
async def github_callback(body: GitHubCallbackRequest, db: Session = Depends(get_db)):
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=400, detail="GitHub OAuth not configured")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": body.code,
            },
            headers={"Accept": "application/json"},
        )
        gh_token = token_res.json().get("access_token")
        if not gh_token:
            raise HTTPException(status_code=400, detail="GitHub auth failed")

        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {gh_token}"},
        )
        gh_user = user_res.json()

        email = gh_user.get("email")
        if not email:
            emails_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {gh_token}"},
            )
            primary = next((e for e in emails_res.json() if e.get("primary")), None)
            email = primary["email"] if primary else f"{gh_user['login']}@github.local"

    user = _find_or_create_oauth_user(
        db,
        oauth_uid=f"github:{gh_user['id']}",
        email=email,
        display_name=gh_user.get("login", "github_user"),
        avatar=gh_user.get("avatar_url"),
    )
    return _make_token(user)


# ── Google OAuth ──────────────────────────────────────────────────────────────

class GoogleCallbackRequest(BaseModel):
    code: str
    redirect_uri: str


@router.get("/google/config")
def google_config():
    if not settings.google_client_id:
        return {"enabled": False}
    return {"enabled": True, "client_id": settings.google_client_id}


@router.post("/google", response_model=Token)
async def google_callback(body: GoogleCallbackRequest, db: Session = Depends(get_db)):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=400, detail="Google OAuth not configured")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": body.code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": body.redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        g_token = token_res.json().get("access_token")
        if not g_token:
            raise HTTPException(status_code=400, detail="Google auth failed")

        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {g_token}"},
        )
        g_user = user_res.json()

    email = g_user.get("email", f"{g_user['id']}@google.local")
    name = g_user.get("name") or g_user.get("given_name") or email.split("@")[0]

    user = _find_or_create_oauth_user(
        db,
        oauth_uid=f"google:{g_user['id']}",
        email=email,
        display_name=name,
        avatar=g_user.get("picture"),
    )
    return _make_token(user)
