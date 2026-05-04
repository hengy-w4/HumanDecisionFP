"""
Rule engine unit tests.

Coverage:
  1. _species_matches – all species/sex combinations
  2. Each of the 44 red flags fires on its own first keyword (parametrized)
  3. Species gating – rules don't fire for the wrong species/sex
  4. Normal eval cases – no false positives
  5. Full eval-dataset run + printed report (adversarial cases expected to pass
     through to the LLM layer; documented but not failed here)
"""

import json
from pathlib import Path

import pytest

from src.rule_engine import _species_matches, run_rule_engine
from src.schemas import PetProfile

_DATA = Path(__file__).parent.parent / "data"
RED_FLAGS: list[dict] = json.loads((_DATA / "red_flags.json").read_text())
EVAL_CASES: list[dict] = json.loads((_DATA / "eval_dataset.json").read_text())

# Canonical profile for each species tag used in red_flags.json
_PROFILE_FOR_SPECIES: dict[str, PetProfile] = {
    "both":     PetProfile(species="dog", sex="female", weight=20.0),
    "cat":      PetProfile(species="cat", sex="female", weight=4.0),
    "dog":      PetProfile(species="dog", sex="female", weight=20.0),
    "cat_male": PetProfile(species="cat", sex="male",   weight=5.0),
    "dog_male": PetProfile(species="dog", sex="male",   weight=22.0),
    "dog_large":PetProfile(species="dog", sex="female", weight=30.0),
    "neonatal": PetProfile(species="dog", sex="female", age=0.1),
}


# ---------------------------------------------------------------------------
# 1. Species-match unit tests
# ---------------------------------------------------------------------------

class TestSpeciesMatching:
    def test_both_accepts_cat(self):
        assert _species_matches("both", PetProfile(species="cat"))

    def test_both_accepts_dog(self):
        assert _species_matches("both", PetProfile(species="dog"))

    def test_cat_accepts_cat(self):
        assert _species_matches("cat", PetProfile(species="cat"))

    def test_cat_rejects_dog(self):
        assert not _species_matches("cat", PetProfile(species="dog"))

    def test_dog_accepts_dog(self):
        assert _species_matches("dog", PetProfile(species="dog"))

    def test_dog_rejects_cat(self):
        assert not _species_matches("dog", PetProfile(species="cat"))

    def test_cat_male_requires_male_sex(self):
        assert _species_matches("cat_male", PetProfile(species="cat", sex="male"))
        assert not _species_matches("cat_male", PetProfile(species="cat", sex="female"))

    def test_cat_male_rejects_unknown_sex(self):
        assert not _species_matches("cat_male", PetProfile(species="cat", sex=None))

    def test_cat_male_rejects_dog(self):
        assert not _species_matches("cat_male", PetProfile(species="dog", sex="male"))

    def test_dog_male_requires_male_sex(self):
        assert _species_matches("dog_male", PetProfile(species="dog", sex="male"))
        assert not _species_matches("dog_male", PetProfile(species="dog", sex="female"))

    def test_dog_large_weight_threshold(self):
        assert _species_matches("dog_large", PetProfile(species="dog", weight=25.0))
        assert not _species_matches("dog_large", PetProfile(species="dog", weight=24.9))
        assert not _species_matches("dog_large", PetProfile(species="cat", weight=30.0))

    def test_neonatal_age_threshold(self):
        assert _species_matches("neonatal", PetProfile(species="dog", age=0.1))
        assert not _species_matches("neonatal", PetProfile(species="dog", age=0.5))

    def test_neutered_male_synonym(self):
        assert _species_matches("cat_male", PetProfile(species="cat", sex="neutered male"))
        assert _species_matches("dog_male", PetProfile(species="dog", sex="unneutered male"))


# ---------------------------------------------------------------------------
# 2. Every red flag fires on its own first keyword
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("rule", RED_FLAGS, ids=[r["id"] for r in RED_FLAGS])
def test_red_flag_triggers_on_first_keyword(rule: dict):
    profile = _PROFILE_FOR_SPECIES[rule["species"]]
    keyword = rule["keywords"][0]
    result = run_rule_engine(profile, keyword)

    assert result.urgency == "emergency", (
        f"{rule['id']} did not trigger emergency.\n"
        f"  Keyword used : '{keyword}'\n"
        f"  Species tag  : {rule['species']}\n"
        f"  Profile used : species={profile.species}, sex={profile.sex}"
    )
    assert any(rule["id"] in t for t in result.triggered_rules), (
        f"{rule['id']} triggered emergency but is not listed in triggered_rules: "
        f"{result.triggered_rules}"
    )


# ---------------------------------------------------------------------------
# 3. Species gating – rules must NOT fire for wrong species or sex
# ---------------------------------------------------------------------------

class TestSpeciesGating:
    def test_cat_male_urethral_block_skips_female_cat(self):
        # RF011 is cat_male only
        profile = PetProfile(species="cat", sex="female")
        result = run_rule_engine(profile, "straining to urinate")
        assert result.urgency != "emergency", (
            "RF011 should not fire for a female cat"
        )

    def test_cat_male_urethral_block_skips_male_dog(self):
        # RF011 is cat_male; RF012 (dog_male) has different keywords
        profile = PetProfile(species="dog", sex="male")
        result = run_rule_engine(profile, "straining to urinate")
        assert result.urgency != "emergency", (
            "RF011 ('straining to urinate') keyword is cat_male only and "
            "should not fire for a male dog"
        )

    def test_cat_bradycardia_skips_dog(self):
        # RF010 keywords: "slow heartbeat", "very slow pulse", "heart rate very low"
        # These keywords are cat-only (RF010); no "both" rule shares them
        profile = PetProfile(species="dog", sex="female")
        result = run_rule_engine(profile, "slow heartbeat and very slow pulse")
        assert result.urgency != "emergency", (
            "RF010 should not fire for a dog"
        )

    def test_open_mouth_breathing_skips_dog(self):
        # RF002 keyword "open mouth breathing" is cat-only;
        # RF001 ("both") uses "labored breathing" / "struggling to breathe"
        profile = PetProfile(species="dog", sex="female")
        result = run_rule_engine(profile, "open mouth breathing")
        assert result.urgency != "emergency", (
            "RF002 ('open mouth breathing') is cat-only and must not fire for a dog"
        )

    def test_dog_male_urethral_block_skips_female_dog(self):
        # RF012 is dog_male only
        profile = PetProfile(species="dog", sex="female")
        result = run_rule_engine(profile, "can't urinate no urine blocked")
        assert result.urgency != "emergency", (
            "RF012 should not fire for a female dog"
        )

    def test_acetaminophen_cat_rule_skips_dog(self):
        # RF030 is cat-only ("tylenol" keyword)
        profile = PetProfile(species="dog", sex="female")
        result = run_rule_engine(profile, "tylenol")
        # RF031 (dog) also has keyword "tylenol overdose" but not bare "tylenol"
        # So a dog with just "tylenol" text should NOT trigger emergency
        assert result.urgency != "emergency", (
            "RF030 ('tylenol') is cat-only; a dog with just 'tylenol' in text "
            "should not trigger (RF031 requires 'tylenol overdose' or 'ate many pain pills')"
        )


# ---------------------------------------------------------------------------
# 4. Normal eval cases – zero false positives
# ---------------------------------------------------------------------------

_NORMAL_CASES = [c for c in EVAL_CASES if not c["is_adversarial"]]


@pytest.mark.parametrize("case", _NORMAL_CASES, ids=[c["case_id"] for c in _NORMAL_CASES])
def test_normal_case_no_false_positive(case: dict):
    profile = PetProfile(**case["pet_profile"])
    result = run_rule_engine(profile, case["symptom_text"])
    assert result.urgency != "emergency", (
        f"FALSE POSITIVE on {case['case_id']} (ground truth: {case['ground_truth_urgency']})\n"
        f"  Triggered rules: {result.triggered_rules}\n"
        f"  Symptom text: {case['symptom_text'][:120]}"
    )


# ---------------------------------------------------------------------------
# 5. Full eval-dataset run + printed report
#    Adversarial cases are expected to pass through (expected_catch_layer=llm).
#    This test always passes but prints a clear coverage table.
# ---------------------------------------------------------------------------

def test_eval_full_run_report(capsys):
    rows = []
    for case in EVAL_CASES:
        profile = PetProfile(**case["pet_profile"])
        result = run_rule_engine(profile, case["symptom_text"])
        rule_hit = result.urgency == "emergency"
        gt_emergency = case["ground_truth_urgency"] == "emergency"
        rows.append({
            "id":           case["case_id"],
            "adv":          case["is_adversarial"],
            "gt":           case["ground_truth_urgency"],
            "re_urgency":   result.urgency,
            "rule_hit":     rule_hit,
            "catch_layer":  case["expected_catch_layer"],
            "triggered":    result.triggered_rules,
        })

    hdr = f"{'CASE':<15} {'GT URGENCY':<22} {'RE RESULT':<22} {'HIT':<6} STATUS"
    sep = "-" * 85
    lines = ["\n\n=== Rule Engine – Full Eval Report ===", hdr, sep]

    false_positives = []
    for r in rows:
        if r["adv"] and r["rule_hit"]:
            status = "BONUS CATCH (rule engine got it)"
        elif r["adv"] and not r["rule_hit"]:
            status = "pass-through → LLM (expected)"
        elif not r["adv"] and r["rule_hit"]:
            status = "*** FALSE POSITIVE ***"
            false_positives.append(r)
        else:
            status = "correct pass-through"

        lines.append(
            f"{r['id']:<15} {r['gt']:<22} {r['re_urgency']:<22} {str(r['rule_hit']):<6} {status}"
        )

    lines.append(sep)
    adv_caught = sum(1 for r in rows if r["adv"] and r["rule_hit"])
    adv_total  = sum(1 for r in rows if r["adv"])
    lines.append(
        f"Adversarial: rule engine caught {adv_caught}/{adv_total} "
        f"(the rest correctly deferred to LLM)"
    )
    lines.append(f"False positives on normal cases: {len(false_positives)}")
    print("\n".join(lines))

    assert not false_positives, (
        f"Rule engine produced false positives on normal cases: "
        f"{[r['id'] for r in false_positives]}"
    )
