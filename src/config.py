import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


def get_openai_api_key() -> str:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY not set in environment variables")
    return key


def get_openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")


def get_environment() -> str:
    return os.getenv("ENV", "development")


def is_production() -> bool:
    return get_environment() == "production"
