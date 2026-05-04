from fastapi import FastAPI

from src.llm_triage import run_llm_triage
from src.rule_engine import run_rule_engine
from src.schemas import TriageRequest, TriageResponse

app = FastAPI(title="PetTriage API")


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
