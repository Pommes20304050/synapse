import os

# Set required env vars before any app imports
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
# ANTHROPIC_API_KEY is optional in config — no need to set it for tests
