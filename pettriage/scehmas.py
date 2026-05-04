from typing import Literal

from pydantic import BaseModel


Urgency = Literal["monitor_at_home", "office_appointment", "emergency"]
Confidence = Literal["low", "medium", "high"]


class PetProfile(BaseModel):
    species: str
    breed: str | None = None
    age: float | None = None
    sex: str | None = None
    weight: float | None = None
    known_conditions: list[str] = []


class TriageRequest(BaseModel):
    pet_profile: PetProfile
    symptom_text: str


class ModuleResult(BaseModel):
    urgency: Urgency
    source: str
    reasoning: str
    confidence: Confidence
    clarifying_question: str | None = None
    triggered_rules: list[str] = []


class TriageResponse(BaseModel):
    final_urgency: Urgency
    decision_source: str
    reasoning: str
    rule_result: ModuleResult | None = None
    llm_result: ModuleResult | None = None