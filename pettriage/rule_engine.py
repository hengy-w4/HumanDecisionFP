import json
from pathlib import Path

from pettriage.scehmas import ModuleResult, PetProfile

_RED_FLAGS: list[dict] = json.loads(
    (Path(__file__).parent / "data" / "red_flags.json").read_text()
)

_MALE_TOKENS = {"male", "m", "intact male", "neutered male", "unneutered male"}


def _species_matches(rule_species: str, profile: PetProfile) -> bool:
    s = profile.species.lower()
    sex = (profile.sex or "").lower().strip()
    match rule_species:
        case "both":
            return True
        case "cat":
            return s == "cat"
        case "dog":
            return s == "dog"
        case "cat_male":
            return s == "cat" and sex in _MALE_TOKENS
        case "dog_male":
            return s == "dog" and sex in _MALE_TOKENS
        case "dog_large":
            return s == "dog" and (profile.weight or 0) >= 25
        case "neonatal":
            return (profile.age or 999) < 0.5
        case _:
            return False


def _first_matching_keyword(keywords: list[str], text: str) -> str | None:
    lower = text.lower()
    return next((kw for kw in keywords if kw.lower() in lower), None)


def run_rule_engine(pet_profile: PetProfile, symptom_text: str) -> ModuleResult:
    triggered: list[str] = []

    for rule in _RED_FLAGS:
        if not _species_matches(rule["species"], pet_profile):
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
