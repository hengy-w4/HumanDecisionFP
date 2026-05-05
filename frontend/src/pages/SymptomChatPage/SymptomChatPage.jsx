import { useState } from "react";
import { submitTriage } from "../../api/triageApi.js";
import { mockProfile } from "../../data/mockProfile.js";
import ChatbotResponseArea from "./ChatbotResponseArea.jsx";
import SymptomInputBox from "./SymptomInputBox.jsx";
import "./symptomChatPage.css";

export default function SymptomChatPage({
  onNavigateHome,
  onNavigateResult,
  onTriageComplete,
}) {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedSymptoms = symptoms.trim();

    if (!trimmedSymptoms) {
      setError("Please describe what you are noticing before submitting.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const nextResult = await submitTriage({
        profile: mockProfile,
        symptoms: trimmedSymptoms,
      });
      setResult(nextResult);
      onTriageComplete(nextResult);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
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
