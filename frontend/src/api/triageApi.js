const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const urgencyLabels = {
  emergency: "Emergency",
  office_appointment: "Urgent",
  monitor_at_home: "Monitor",
};

const confidenceScores = {
  low: 45,
  medium: 70,
  high: 90,
};

const confidenceLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const decisionSourceLabels = {
  llm: "LLM",
  rule_engine: "Safety rules",
};

const recommendedActions = {
  emergency:
    "Contact an emergency veterinary clinic now or go to the nearest emergency vet.",
  office_appointment:
    "Call your veterinarian today to schedule an appointment and ask what to monitor until then.",
  monitor_at_home:
    "Monitor at home, keep notes on any changes, and contact your vet if symptoms worsen or continue.",
};

function parseNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeProfile(profile) {
  return {
    species: profile.species.toLowerCase(),
    breed: profile.breed || null,
    age: parseNumber(profile.age),
    sex: profile.sex || null,
    weight: parseNumber(profile.weight),
    known_conditions: profile.knownConditions || [],
  };
}

function getSelectedModuleResult(response) {
  if (response.decision_source === "rule_engine") {
    return response.rule_result;
  }

  return response.llm_result || response.rule_result;
}

function formatRedFlags(triggeredRules = []) {
  return triggeredRules.map((rule) => rule.replace(/\s*\[matched:.*\]$/, ""));
}

export function formatTriageResponse(response, symptoms) {
  const moduleResult = getSelectedModuleResult(response);
  const finalUrgency = response.final_urgency;
  const confidence = moduleResult?.confidence;
  const triggeredRules = response.rule_result?.triggered_rules || [];
  const llmRules = response.llm_result?.triggered_rules || [];
  const isFallback = llmRules.includes("fallback_error");

  return {
    urgency: urgencyLabels[finalUrgency] || "Monitor",
    confidence: confidenceScores[confidence] || 50,
    confidenceLabel: confidenceLabels[confidence] || "Unknown",
    symptoms,
    reasoning: response.reasoning,
    redFlags: formatRedFlags(triggeredRules),
    recommendedAction:
      recommendedActions[finalUrgency] || recommendedActions.monitor_at_home,
    clarifyingQuestion: moduleResult?.clarifying_question,
    decisionSource: response.decision_source,
    decisionSourceLabel:
      decisionSourceLabels[response.decision_source] || response.decision_source,
    isFallback,
    statusMessage: isFallback
      ? "PetTriage needs a little more information before it can provide a confident recommendation."
      : "PetTriage response received.",
    timestamp: "Just now",
  };
}

export async function submitTriage({ profile, symptoms }) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/triage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pet_profile: normalizeProfile(profile),
        symptom_text: symptoms,
      }),
    });
  } catch {
    throw new Error(
      "PetTriage is unavailable right now. Please try again in a moment.",
    );
  }

  if (!response.ok) {
    let detail = "";

    try {
      const errorData = await response.json();
      detail = errorData.detail ? ` ${errorData.detail}` : "";
    } catch {
      detail = "";
    }

    throw new Error(`Unable to complete triage.${detail}`);
  }

  const data = await response.json();
  return formatTriageResponse(data, symptoms);
}
