from uuid import uuid4

from fastapi import FastAPI, HTTPException

from src.llm_triage import run_llm_triage
from src.rule_engine import run_rule_engine
from src.schemas import (
    PetProfile,
    PetProfileRecord,
    PetProfileUpdate,
    TriageRequest,
    TriageResponse,
)

app = FastAPI(title="PetTriage API")

_PROFILE_RECORDS: dict[str, PetProfileRecord] = {}


def _model_data(model):
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


@app.post("/triage", response_model=TriageResponse)
def triage(request: TriageRequest):
    rule_result = run_rule_engine(request.pet_profile, request.symptom_text)

    if rule_result.urgency == "emergency":
        return TriageResponse(
            final_urgency="emergency",
            decision_source="rule_engine",
            reasoning=rule_result.reasoning,
            rule_result=rule_result,
            llm_result=None,
        )

    llm_result = run_llm_triage(request.pet_profile, request.symptom_text)

    if llm_result.urgency == "emergency":
        return TriageResponse(
            final_urgency="emergency",
            decision_source="llm",
            reasoning=llm_result.reasoning,
            rule_result=rule_result,
            llm_result=llm_result,
        )

    return TriageResponse(
        final_urgency=llm_result.urgency,
        decision_source="llm",
        reasoning=llm_result.reasoning,
        rule_result=rule_result,
        llm_result=llm_result,
    )


@app.post("/profiles", response_model=PetProfileRecord)
def create_profile(profile: PetProfile):
    record = PetProfileRecord(id=str(uuid4()), **_model_data(profile))
    _PROFILE_RECORDS[record.id] = record
    return record


@app.get("/profiles", response_model=list[PetProfileRecord])
def list_profiles():
    return list(_PROFILE_RECORDS.values())


@app.get("/profiles/{profile_id}", response_model=PetProfileRecord)
def get_profile(profile_id: str):
    try:
        return _PROFILE_RECORDS[profile_id]
    except KeyError as e:
        raise HTTPException(status_code=404, detail="Profile not found") from e


@app.put("/profiles/{profile_id}", response_model=PetProfileRecord)
def update_profile(profile_id: str, updates: PetProfileUpdate):
    existing = get_profile(profile_id)
    current_data = _model_data(existing)
    current_data.pop("id", None)

    update_data = _model_data(updates)
    for key, value in update_data.items():
        if value is not None:
            current_data[key] = value

    updated = PetProfileRecord(id=profile_id, **current_data)
    _PROFILE_RECORDS[profile_id] = updated
    return updated
