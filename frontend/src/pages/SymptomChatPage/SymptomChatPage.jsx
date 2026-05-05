import { useState } from "react";
import { mockProfile } from "../../data/mockProfile.js";
import ChatbotResponseArea from "./ChatbotResponseArea.jsx";
import SymptomInputBox from "./SymptomInputBox.jsx";
import "./symptomChatPage.css";

const emergencyTerms = [
  "collapse",
  "seizure",
  "can't breathe",
  "cannot breathe",
  "blue gums",
  "unconscious",
  "poison",
  "bleeding",
];

const urgentTerms = [
  "vomit",
  "vomiting",
  "diarrhea",
  "limp",
  "limping",
  "not eating",
  "lethargic",
  "pain",
  "cough",
];

function findMatches(text, terms) {
  return terms.filter((term) => text.includes(term));
}

function createTriageResult(symptoms) {
  const normalizedSymptoms = symptoms.toLowerCase();
  const emergencyMatches = findMatches(normalizedSymptoms, emergencyTerms);
  const urgentMatches = findMatches(normalizedSymptoms, urgentTerms);
  const hasEmergency = emergencyMatches.length > 0;
  const hasUrgent = urgentMatches.length > 0;

  if (hasEmergency) {
    return {
      urgency: "Emergency",
      confidence: 91,
      reasoning:
        "The description includes possible emergency red flags that can worsen quickly and should be assessed in person.",
      redFlags: emergencyMatches,
      recommendedAction:
        "Contact an emergency veterinary clinic now or go to the nearest emergency vet.",
      clarifyingQuestion:
        "Is your pet conscious, breathing normally, and able to stand right now?",
      timestamp: "Just now",
    };
  }

  if (hasUrgent) {
    return {
      urgency: "Urgent",
      confidence: 78,
      reasoning:
        "The symptoms may need timely veterinary guidance, especially if they are new, worsening, repeated, or paired with behavior changes.",
      redFlags: urgentMatches,
      recommendedAction:
        "Call your vet today for advice and monitor for breathing trouble, collapse, repeated vomiting, or severe pain.",
      clarifyingQuestion:
        "How long has this been happening, and is your pet eating, drinking, and acting normally?",
      timestamp: "Just now",
    };
  }

  return {
    urgency: "Monitor",
    confidence: 68,
    reasoning:
      "The description does not include obvious emergency indicators, so careful home monitoring may be reasonable for now.",
    redFlags: [],
    recommendedAction:
      "Keep monitoring symptoms, provide fresh water, and contact your vet if anything worsens or lasts more than a day.",
    clarifyingQuestion:
      "Has this happened before, and are there any changes in appetite, energy, breathing, or bathroom habits?",
    timestamp: "Just now",
  };
}

export default function SymptomChatPage({
  onNavigateHome,
  onNavigateResult,
  onTriageComplete,
}) {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedSymptoms = symptoms.trim();

    if (!trimmedSymptoms) {
      setError("Please describe what you are noticing before submitting.");
      return;
    }

    setError("");
    setIsLoading(true);

    window.setTimeout(() => {
      const nextResult = {
        ...createTriageResult(trimmedSymptoms),
        symptoms: trimmedSymptoms,
      };
      setResult(nextResult);
      onTriageComplete(nextResult);
      setIsLoading(false);
    }, 350);
  };

  return (
    <main className="symptom-chat-page">
      <header className="chat-header">
        <button className="back-button" type="button" onClick={onNavigateHome}>
          Back Home
        </button>
        <div>
          <p className="eyebrow">Symptom Chatbot</p>
          <h1>Tell us what is happening with {mockProfile.petName}</h1>
          <p>
            Share symptoms in your own words and PetTriage will return a clear
            urgency recommendation with reasoning.
          </p>
        </div>
      </header>

      <div className="chat-layout">
        <section className="chat-panel" aria-labelledby="input-title">
          <div className="chat-panel__heading">
            <p className="eyebrow">New Check</p>
            <h2 id="input-title">Symptom details</h2>
          </div>
          <SymptomInputBox
            value={symptoms}
            onChange={setSymptoms}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          {error ? <p className="input-error">{error}</p> : null}
          <div className="disclaimer">
            PetTriage is not a diagnosis. For severe symptoms or rapid changes,
            contact a veterinarian immediately.
          </div>
        </section>

        <ChatbotResponseArea result={result} onViewResult={onNavigateResult} />
      </div>
    </main>
  );
}
