import sys
from importlib.util import find_spec
from types import ModuleType

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

    fastapi_stub.FastAPI = _FakeFastAPI
    sys.modules["fastapi"] = fastapi_stub

from src.main import (  # noqa: E402
    _OVERRIDE_RECORDS,
    _VET_FEEDBACK_RECORDS,
    list_overrides,
    list_vet_feedback,
    record_override,
    record_vet_feedback,
)
from src.schemas import OverrideRequest, PetProfile, VetFeedbackRequest  # noqa: E402


def setup_function():
    _OVERRIDE_RECORDS.clear()
    _VET_FEEDBACK_RECORDS.clear()


def _profile() -> PetProfile:
    return PetProfile(
        species="cat",
        breed="Domestic Shorthair",
        age=4.0,
        sex="male",
        weight=5.0,
        known_conditions=[],
    )


def test_record_override_returns_and_stores_record():
    request = OverrideRequest(
        triage_id="triage-123",
        pet_profile=_profile(),
        symptom_text="He keeps visiting the litter box.",
        original_urgency="office_appointment",
        override_choice="more_serious",
        override_urgency="emergency",
        reason="Owner is worried about urinary blockage.",
    )

    record = record_override(request)

    assert record.id
    assert record.created_at is not None
    assert record.triage_id == "triage-123"
    assert record.original_urgency == "office_appointment"
    assert record.override_choice == "more_serious"
    assert record.override_urgency == "emergency"
    assert record.reason == "Owner is worried about urinary blockage."
    assert list_overrides() == [record]


def test_record_vet_feedback_returns_and_stores_record():
    request = VetFeedbackRequest(
        triage_id="triage-123",
        pet_profile=_profile(),
        symptom_text="He keeps visiting the litter box.",
        original_urgency="emergency",
        visited_vet=True,
        vet_recommendation="Emergency care",
        pettriage_correct="yes",
        user_override_urgency=None,
        vet_urgency="emergency",
        diagnosis="Urethral obstruction",
        treatment="Emergency catheterization",
        notes="Owner went to ER immediately.",
    )

    record = record_vet_feedback(request)

    assert record.id
    assert record.created_at is not None
    assert record.triage_id == "triage-123"
    assert record.visited_vet is True
    assert record.vet_recommendation == "Emergency care"
    assert record.pettriage_correct == "yes"
    assert record.vet_urgency == "emergency"
    assert record.diagnosis == "Urethral obstruction"
    assert record.treatment == "Emergency catheterization"
    assert list_vet_feedback() == [record]


def test_record_vet_feedback_supports_no_vet_visit():
    request = VetFeedbackRequest(
        triage_id="triage-456",
        pet_profile=_profile(),
        symptom_text="He sneezed twice and then acted normal.",
        original_urgency="monitor_at_home",
        visited_vet=False,
        vet_recommendation=None,
        pettriage_correct="not_sure",
        vet_urgency=None,
        diagnosis=None,
        treatment=None,
        notes="Owner monitored at home.",
    )

    record = record_vet_feedback(request)

    assert record.visited_vet is False
    assert record.vet_recommendation is None
    assert record.vet_urgency is None
    assert record.notes == "Owner monitored at home."
    assert list_vet_feedback() == [record]
