from typing import Literal, Optional

from pydantic import BaseModel


Urgency = Literal["monitor_at_home", "office_appointment", "emergency"]
Confidence = Literal["low", "medium", "high"]


class PetProfile(BaseModel):
    species: str
    pet_name: Optional[str] = None
    owner_name: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[float] = None
    sex: Optional[str] = None
    weight: Optional[float] = None
    spayed_neutered: Optional[str] = None
    known_conditions: list[str] = []
    medications: list[str] = []
    vaccination_status: Optional[str] = None


class PetProfileUpdate(BaseModel):
    species: Optional[str] = None
    pet_name: Optional[str] = None
    owner_name: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[float] = None
    sex: Optional[str] = None
    weight: Optional[float] = None
    spayed_neutered: Optional[str] = None
    known_conditions: Optional[list[str]] = None
    medications: Optional[list[str]] = None
    vaccination_status: Optional[str] = None


class PetProfileRecord(PetProfile):
    id: str


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
