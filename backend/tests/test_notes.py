import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import User, Note
from app.services.auth import hash_password, create_access_token
from datetime import timedelta

TEST_DB = "sqlite:///./test.db"
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


@pytest.fixture
def db():
    db = TestingSession()
    yield db
    db.close()


@pytest.fixture
def user(db):
    u = User(email="test@test.com", username="testuser", hashed_password=hash_password("pass123"))
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture
def auth_headers(user):
    token = create_access_token({"sub": str(user.id)}, timedelta(hours=1))
    return {"Authorization": f"Bearer {token}"}


client = TestClient(app)


def test_create_note(auth_headers):
    res = client.post(
        "/api/notes/",
        json={"title": "Test Note", "content": "Hello world", "tags": ["test"]},
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Note"
    assert data["content"] == "Hello world"


def test_list_notes(auth_headers, db, user):
    db.add(Note(title="Note A", content="Content A", owner_id=user.id))
    db.add(Note(title="Note B", content="Content B", owner_id=user.id))
    db.commit()

    res = client.get("/api/notes/", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_get_note(auth_headers, db, user):
    note = Note(title="My Note", content="My content", owner_id=user.id)
    db.add(note)
    db.commit()
    db.refresh(note)

    res = client.get(f"/api/notes/{note.id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "My Note"


def test_update_note(auth_headers, db, user):
    note = Note(title="Old Title", content="Old content", owner_id=user.id)
    db.add(note)
    db.commit()
    db.refresh(note)

    res = client.patch(
        f"/api/notes/{note.id}",
        json={"title": "New Title"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["title"] == "New Title"


def test_delete_note(auth_headers, db, user):
    note = Note(title="To Delete", content="bye", owner_id=user.id)
    db.add(note)
    db.commit()
    db.refresh(note)

    res = client.delete(f"/api/notes/{note.id}", headers=auth_headers)
    assert res.status_code == 204

    res = client.get(f"/api/notes/{note.id}", headers=auth_headers)
    assert res.status_code == 404


def test_note_not_found(auth_headers):
    res = client.get("/api/notes/9999", headers=auth_headers)
    assert res.status_code == 404


def test_unauthorized():
    res = client.get("/api/notes/")
    assert res.status_code == 401
