import anthropic
from ..config import get_settings

settings = get_settings()
_client: anthropic.Anthropic | None = None


def _get_api_key() -> str:
    """Get API key: DB first, then env var."""
    from ..database import SessionLocal
    from ..models.setting import Setting
    db = SessionLocal()
    try:
        row = db.query(Setting).filter(Setting.key == "anthropic_api_key").first()
        if row and row.value:
            return row.value
    finally:
        db.close()

    if settings.anthropic_api_key:
        return settings.anthropic_api_key

    raise RuntimeError(
        "Anthropic API key not configured. "
        "Set it in the app settings or via ANTHROPIC_API_KEY env var."
    )


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=_get_api_key())
    return _client


async def generate_summary(content: str) -> str:
    client = get_client()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        system="You are a concise summarizer. Summarize the given text in 2-3 sentences. Return only the summary, no preamble.",
        messages=[{"role": "user", "content": f"Summarize this note:\n\n{content}"}],
    )
    return response.content[0].text.strip()


async def generate_tags(title: str, content: str) -> list[str]:
    client = get_client()
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=128,
        system=(
            "Generate 3-6 relevant tags for the given note. "
            "Return only a comma-separated list of lowercase tags, no explanation."
        ),
        messages=[{"role": "user", "content": f"Title: {title}\n\nContent: {content[:1000]}"}],
    )
    raw = response.content[0].text.strip()
    return [t.strip().lstrip("#") for t in raw.split(",") if t.strip()]


async def chat_with_notes(question: str, notes_context: list[dict], history: list[dict]) -> str:
    client = get_client()
    context_str = "\n\n---\n\n".join(
        f"Note: {n['title']}\n{n['content']}" for n in notes_context
    )
    messages = history[-10:] + [{"role": "user", "content": question}]
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are Synapse, a helpful AI assistant. "
            "Use the user's notes as context to answer their questions accurately. "
            "If the answer isn't in the notes, say so and answer from general knowledge.\n\n"
            f"USER'S NOTES:\n{context_str}"
        ),
        messages=messages,
    )
    return response.content[0].text.strip()


async def smart_search(query: str, notes: list[dict]) -> list[int]:
    client = get_client()
    notes_list = "\n".join(f"[{n['id']}] {n['title']}: {n['content'][:200]}" for n in notes)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=128,
        system=(
            "You are a search assistant. Given a query and a list of notes, "
            "return the IDs of the most relevant notes as a comma-separated list. "
            "Return only the IDs, nothing else. Return at most 10 IDs."
        ),
        messages=[{"role": "user", "content": f"Query: {query}\n\nNotes:\n{notes_list}"}],
    )
    raw = response.content[0].text.strip()
    try:
        return [int(x.strip()) for x in raw.split(",") if x.strip().isdigit()]
    except ValueError:
        return []
