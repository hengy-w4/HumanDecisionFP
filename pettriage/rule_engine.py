from pettriage.schemas import ModuleResult, PetProfile


def run_rule_engine(pet_profile: PetProfile, symptom_text: str) -> ModuleResult:
    return ModuleResult(
        urgency="monitor_at_home",
        source="rule_engine",
        reasoning="No hard red-flag rule was triggered.",
        confidence="medium",
        clarifying_question=None,
        triggered_rules=[],
    )