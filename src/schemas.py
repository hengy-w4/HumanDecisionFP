from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


Urgency = Literal["monitor_at_home", "office_appointment", "emergency"]
Confidence = Literal["low", "medium", "high"]
OverrideChoice = Literal["more_serious", "less_serious", "not_sure"]
Correctness = Literal["yes", "no", "not_sure"]


class PetProfile(BaseModel):
    species: str
    breed: Optional[str] = None
    age: Optional[float] = None
    sex: Optional[str] = None
    weight: Optional[float] = None
    known_conditions: list[str] = []


class TriageRequest(BaseModel):
    pet_profile: PetProfile
    symptom_text: str


class ModuleResult(BaseModel):
    urgency: Urgency
    source: str
    reasoning: str
    confidence: Confidence
    clarifying_question: Optional[str] = None
    triggered_rules: list[str] = []


class TriageResponse(BaseModel):
    final_urgency: Urgency
    decision_source: str
    reasoning: str
    rule_result: Optional[ModuleResult] = None
    llm_result: Optional[ModuleResult] = None


class OverrideRequest(BaseModel):
    triage_id: Optional[str] = None
    pet_profile: PetProfile
    symptom_text: str
    original_urgency: Urgency
    override_choice: OverrideChoice
    override_urgency: Optional[Urgency] = None
    reason: Optional[str] = None


class OverrideRecord(OverrideRequest):
    id: str
    created_at: datetime


class VetFeedbackRequest(BaseModel):
    triage_id: Optional[str] = None
    pet_profile: PetProfile
    symptom_text: str
    original_urgency: Urgency
    visited_vet: bool
    vet_recommendation: Optional[str] = None
    pettriage_correct: Optional[Correctness] = None
    vet_urgency: Optional[Urgency] = None
    user_override_urgency: Optional[Urgency] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None


class VetFeedbackRecord(VetFeedbackRequest):
    id: str
    created_at: datetime
