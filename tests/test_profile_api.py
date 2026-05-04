import sys
from importlib.util import find_spec
from types import ModuleType

import pytest

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

from src.main import (  # noqa: E402
    _PROFILE_RECORDS,
    create_profile,
    get_profile,
    list_profiles,
    update_profile,
)
from src.schemas import PetProfile, PetProfileUpdate  # noqa: E402


def setup_function():
    _PROFILE_RECORDS.clear()


def _profile() -> PetProfile:
    return PetProfile(
        species="dog",
        pet_name="Mochi",
        owner_name="Alex",
        breed="Corgi mix",
        age=5.0,
        sex="female",
        weight=24.0,
        spayed_neutered="spayed",
        known_conditions=["Seasonal allergies"],
        medications=["Monthly flea prevention"],
        vaccination_status="Up to date",
    )


def test_create_profile_returns_and_stores_record():
    record = create_profile(_profile())

    assert record.id
    assert record.pet_name == "Mochi"
    assert record.owner_name == "Alex"
    assert record.species == "dog"
    assert record.known_conditions == ["Seasonal allergies"]
    assert list_profiles() == [record]
    assert get_profile(record.id) == record


def test_update_profile_changes_only_provided_fields():
    record = create_profile(_profile())

    updated = update_profile(
        record.id,
        PetProfileUpdate(
            pet_name="Mochi Bean",
            weight=25.5,
            known_conditions=["Seasonal allergies", "Sensitive stomach"],
        ),
    )

    assert updated.id == record.id
    assert updated.pet_name == "Mochi Bean"
    assert updated.weight == 25.5
    assert updated.known_conditions == ["Seasonal allergies", "Sensitive stomach"]
    assert updated.species == "dog"
    assert updated.breed == "Corgi mix"
    assert get_profile(record.id) == updated


def test_update_profile_can_clear_list_fields():
    record = create_profile(_profile())

    updated = update_profile(
        record.id,
        PetProfileUpdate(known_conditions=[], medications=[]),
    )

    assert updated.known_conditions == []
    assert updated.medications == []


def test_get_profile_missing_id_raises_404():
    with pytest.raises(Exception) as exc_info:
        get_profile("missing-profile")

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Profile not found"


def test_update_profile_missing_id_raises_404():
    with pytest.raises(Exception) as exc_info:
        update_profile("missing-profile", PetProfileUpdate(pet_name="Mochi"))

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Profile not found"
