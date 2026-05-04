"""LLM-based pet symptom triage using OpenAI."""

import json

from openai import OpenAI

from src.config import get_openai_api_key, get_openai_model
from src.prompt_templates import build_user_prompt, get_system_prompt
from src.schemas import ModuleResult, PetProfile


_REQUIRED_RESPONSE_FIELDS = {"urgency", "reasoning", "confidence"}
_OPTIONAL_RESPONSE_FIELDS = {"clarifying_question"}
_ALLOWED_RESPONSE_FIELDS = _REQUIRED_RESPONSE_FIELDS | _OPTIONAL_RESPONSE_FIELDS
_URGENCY_VALUES = {"monitor_at_home", "office_appointment", "emergency"}
_CONFIDENCE_VALUES = {"low", "medium", "high"}


def _get_openai_client() -> OpenAI:
    """Create an OpenAI client from environment configuration."""
    return OpenAI(api_key=get_openai_api_key())


def _parse_llm_response(response_text: str) -> dict:
    """Parse a strict JSON object returned by the LLM."""
    try:
        data = json.loads(response_text)
    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {response_text}") from e

    if not isinstance(data, dict):
        raise ValueError("LLM response must be a JSON object")

    return data


def _validate_response_structure(data: dict) -> None:
    """Validate that the response matches the strict triage schema."""
    missing = _REQUIRED_RESPONSE_FIELDS - set(data.keys())
    if missing:
        raise ValueError(f"Missing required fields in LLM response: {missing}")

    extra = set(data.keys()) - _ALLOWED_RESPONSE_FIELDS
    if extra:
        raise ValueError(f"Unexpected fields in LLM response: {extra}")

    if data.get("urgency") not in _URGENCY_VALUES:
        raise ValueError(f"Invalid urgency value: {data.get('urgency')}")

    if data.get("confidence") not in _CONFIDENCE_VALUES:
        raise ValueError(f"Invalid confidence value: {data.get('confidence')}")

    if not isinstance(data.get("reasoning"), str) or not data["reasoning"].strip():
        raise ValueError("LLM reasoning must be a non-empty string")

    clarifying_question = data.get("clarifying_question")
    if clarifying_question is not None and not isinstance(clarifying_question, str):
        raise ValueError("clarifying_question must be a string or null")


def _call_openai_api(system_prompt: str, user_prompt: str) -> str:
    """Call OpenAI API in JSON mode."""
    client = _get_openai_client()
    model = get_openai_model()

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=500,
    )

    content = response.choices[0].message.content
    if content is None:
        raise ValueError("OpenAI response did not include message content")
    return content


def run_llm_triage(pet_profile: PetProfile, symptom_text: str) -> ModuleResult:
    """Run LLM-based triage on pet symptoms.

    Returns structured urgency recommendation with reasoning and confidence.
    Falls back to conservative guidance if the LLM response is malformed.
    """
    try:
        system_prompt = get_system_prompt()
        user_prompt = build_user_prompt(pet_profile, symptom_text)

        llm_response = _call_openai_api(system_prompt, user_prompt)
        response_data = _parse_llm_response(llm_response)
        _validate_response_structure(response_data)

        return ModuleResult(
            urgency=response_data["urgency"],
            source="llm",
            reasoning=response_data["reasoning"],
            confidence=response_data["confidence"],
            clarifying_question=response_data.get("clarifying_question"),
            triggered_rules=[],
        )

    except Exception as e:
        print(f"LLM triage error: {e}")
        return ModuleResult(
            urgency="office_appointment",
            source="llm",
            reasoning="Unable to fully process symptom description. Please schedule a veterinary appointment for evaluation.",
            confidence="low",
            clarifying_question=None,
            triggered_rules=["fallback_error"],
        )
