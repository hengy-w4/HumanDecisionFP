import sys
from importlib.util import find_spec
from types import ModuleType
from unittest.mock import patch

if find_spec("fastapi") is None:
    fastapi_stub = ModuleType("fastapi")

    class _FakeFastAPI:
        def __init__(self, *args, **kwargs):
            pass

        def _route(self, *args, **kwargs):
            def decorator(func):
                return func

            return decorator

        post = _route
        get = _route
        put = _route

    class _FakeHTTPException(Exception):
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail

    fastapi_stub.FastAPI = _FakeFastAPI
    fastapi_stub.HTTPException = _FakeHTTPException
    sys.modules["fastapi"] = fastapi_stub

from src.main import triage
from src.schemas import ModuleResult, PetProfile, TriageRequest


def _request(symptom_text: str, species: str = "dog", sex: str = "female") -> TriageRequest:
    return TriageRequest(
        pet_profile=PetProfile(species=species, sex=sex),
        symptom_text=symptom_text,
    )


def _llm_result(urgency: str) -> ModuleResult:
    return ModuleResult(
        urgency=urgency,
        source="llm",
        reasoning=f"LLM recommends {urgency}.",
        confidence="medium",
        clarifying_question=None,
        triggered_rules=[],
    )


def test_rule_engine_emergency_short_circuits_llm():
    request = _request(
        symptom_text="My cat is straining to urinate and nothing is coming out.",
        species="cat",
        sex="male",
    )

    with patch("src.main.run_llm_triage") as mock_llm:
        response = triage(request)

    mock_llm.assert_not_called()
    assert response.final_urgency == "emergency"
    assert response.decision_source == "rule_engine"
    assert response.rule_result is not None
    assert response.rule_result.urgency == "emergency"
    assert response.llm_result is None


@patch("src.main.run_llm_triage")
def test_llm_emergency_escalates_when_rule_engine_does_not(mock_llm):
    mock_llm.return_value = _llm_result("emergency")

    response = triage(_request("My dog is acting strange but no obvious red flags."))

    mock_llm.assert_called_once()
    assert response.final_urgency == "emergency"
    assert response.decision_source == "llm"
    assert response.rule_result is not None
    assert response.rule_result.urgency == "monitor_at_home"
    assert response.llm_result == mock_llm.return_value


@patch("src.main.run_llm_triage")
def test_non_emergency_uses_llm_urgency(mock_llm):
    mock_llm.return_value = _llm_result("office_appointment")

    response = triage(_request("My dog sneezed a few times today."))

    mock_llm.assert_called_once()
    assert response.final_urgency == "office_appointment"
    assert response.decision_source == "llm"
    assert response.reasoning == "LLM recommends office_appointment."
    assert response.llm_result == mock_llm.return_value
