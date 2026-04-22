# ⬡ Synapse — AI-Powered Knowledge Base

![CI](https://github.com/Pommes20304050/synapse/actions/workflows/ci.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

Synapse is a self-hosted, AI-powered personal knowledge management system. Write Markdown notes, let Claude auto-summarize and tag them, then chat with your entire knowledge base using natural language.

<img width="1917" height="908" alt="image" src="https://github.com/user-attachments/assets/f88ecce4-2a97-4ddb-b2b8-e96f59e1766a" />



## Features

- **Markdown Notes** — full editor with live preview
- **AI Summarization** — Claude generates a 2-3 sentence summary per note
- **Auto-Tagging** — Claude generates relevant tags automatically on save
- **AI Chat** — ask questions across your entire knowledge base
- **Semantic Search** — find notes by meaning, not just keywords
- **Dashboard** — stats, top tags, AI insights about your notes
- **Dark UI** — clean, minimal interface built with Tailwind CSS
- **JWT Auth** — secure user accounts with bcrypt passwords
- **Docker** — one-command deploy with `docker compose up`

## Quick Start

### 1. Clone & configure

```bash
git clone https://github.com/Pommes20304050/synapse.git
cd synapse
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Run with Docker

```bash
docker compose up --build
```

Open **http://localhost:3000** — register an account and start taking notes.

### 3. Run locally (development)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp ../.env.example .env   # set ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## API Docs

With the backend running, visit **http://localhost:8000/api/docs** for the interactive Swagger UI.

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Get JWT token |
| `/api/notes/` | GET/POST | List or create notes |
| `/api/notes/{id}` | GET/PATCH/DELETE | Manage a note |
| `/api/notes/{id}/summarize` | POST | AI summarize |
| `/api/notes/{id}/tag` | POST | AI auto-tag |
| `/api/ai/chat` | POST | Chat with your notes |
| `/api/ai/insights` | GET | AI insight about your knowledge base |
| `/api/search/` | GET | Full-text or semantic search |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| AI | Anthropic Claude (Sonnet + Haiku) |
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Auth | JWT, bcrypt via passlib |
| Deploy | Docker, docker compose, Nginx |
| CI | GitHub Actions |

## Tests

```bash
cd backend
pytest tests/ -v
```

## License

MIT
