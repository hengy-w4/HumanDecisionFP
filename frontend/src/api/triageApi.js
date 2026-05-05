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

export function formatTriageResponse(response, symptoms) {
  const moduleResult = getSelectedModuleResult(response);
  const finalUrgency = response.final_urgency;

  return {
    urgency: urgencyLabels[finalUrgency] || "Monitor",
    confidence: confidenceScores[moduleResult?.confidence] || 50,
    confidenceLabel: moduleResult?.confidence || "unknown",
    symptoms,
    reasoning: response.reasoning,
    redFlags: response.rule_result?.triggered_rules || [],
    recommendedAction:
      recommendedActions[finalUrgency] || recommendedActions.monitor_at_home,
    clarifyingQuestion: moduleResult?.clarifying_question,
    decisionSource: response.decision_source,
    timestamp: "Just now",
  };
}

export async function submitTriage({ profile, symptoms }) {
  const response = await fetch(`${API_BASE_URL}/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pet_profile: normalizeProfile(profile),
      symptom_text: symptoms,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to complete triage. Please try again.");
  }

  const data = await response.json();
  return formatTriageResponse(data, symptoms);
}
