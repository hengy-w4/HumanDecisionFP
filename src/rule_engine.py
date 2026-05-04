import json
from pathlib import Path
from typing import Optional

from src.schemas import ModuleResult, PetProfile

_RED_FLAGS: list[dict] = json.loads(
    (Path(__file__).parent.parent / "data" / "red_flags.json").read_text()
)

_MALE_TOKENS = {"male", "m", "intact male", "neutered male", "unneutered male"}


def _species_matches(rule_species: str, rule_sex: str, profile: PetProfile) -> bool:
    s = profile.species.lower()
    sex = (profile.sex or "").lower().strip()
    if rule_species != "any" and rule_species != s:
        return False
    if rule_sex == "male" and sex not in _MALE_TOKENS:
        return False
    return True


def _first_matching_keyword(keywords: list[str], text: str) -> Optional[str]:
    lower = text.lower()
    return next((kw for kw in keywords if kw.lower() in lower), None)


def run_rule_engine(pet_profile: PetProfile, symptom_text: str) -> ModuleResult:
    triggered: list[str] = []

    for rule in _RED_FLAGS:
        if not _species_matches(rule["species"], rule["sex"], pet_profile):
            continue
        hit = _first_matching_keyword(rule["keywords"], symptom_text)
        if hit:
            triggered.append(f"{rule['id']}: {rule['symptom']} [matched: \"{hit}\"]")

    if triggered:
        lead_id = triggered[0].split(":")[0]
        lead_rule = next(r for r in _RED_FLAGS if r["id"] == lead_id)
        return ModuleResult(
            urgency="emergency",
            source="rule_engine",
            reasoning=lead_rule["reasoning"],
            confidence="high",
            clarifying_question=None,
            triggered_rules=triggered,
        )

    return ModuleResult(
        urgency="monitor_at_home",
        source="rule_engine",
        reasoning="No hard red-flag rule was triggered.",
        confidence="medium",
        clarifying_question=None,
        triggered_rules=[],
    )
