import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

TEST_DB = "sqlite:///./test_auth.db"
engine = create_engine(TEST_DB, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_register():
    res = client.post(
        "/api/auth/register",
        json={"email": "user@test.com", "username": "newuser", "password": "secret123"},
    )
    assert res.status_code == 201
    assert res.json()["username"] == "newuser"


def test_register_duplicate_email():
    payload = {"email": "dup@test.com", "username": "user1", "password": "pass"}
    client.post("/api/auth/register", json=payload)
    res = client.post(
        "/api/auth/register",
        json={**payload, "username": "user2"},
    )
    assert res.status_code == 400


def test_login():
    client.post(
        "/api/auth/register",
        json={"email": "login@test.com", "username": "loginuser", "password": "mypass"},
    )
    res = client.post(
        "/api/auth/login",
        data={"username": "loginuser", "password": "mypass"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password():
    client.post(
        "/api/auth/register",
        json={"email": "wrong@test.com", "username": "wronguser", "password": "correct"},
    )
    res = client.post(
        "/api/auth/login",
        data={"username": "wronguser", "password": "wrong"},
    )
    assert res.status_code == 401


def test_me():
    client.post(
        "/api/auth/register",
        json={"email": "me@test.com", "username": "meuser", "password": "pass123"},
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": "meuser", "password": "pass123"},
    )
    token = login_res.json()["access_token"]
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "meuser"
