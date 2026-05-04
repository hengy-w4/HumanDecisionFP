from src.schemas import ModuleResult, PetProfile


def run_llm_triage(pet_profile: PetProfile, symptom_text: str) -> ModuleResult:
    return ModuleResult(
        urgency="office_appointment",
        source="llm",
        reasoning="Mock LLM result. Replace with structured LLM triage logic.",
        confidence="medium",
        clarifying_question=None,
        triggered_rules=[],
    )
