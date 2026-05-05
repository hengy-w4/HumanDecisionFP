import { useState } from "react";
import { submitVetFeedback } from "../../api/feedbackApi.js";
import { mockProfile } from "../../data/mockProfile.js";
import { mockTriageResult } from "../../data/mockTriageResult.js";
import VetFeedbackForm from "./VetFeedbackForm.jsx";
import "./vetFeedbackPage.css";

const initialFormData = {
  visitedVet: "",
  vetRecommendation: "",
  triageCorrect: "",
  vetNotes: "",
  additionalComments: "",
};

export default function VetFeedbackPage({
  triageResult,
  onNavigateHome,
  onNavigateResult,
}) {
  const result = triageResult || mockTriageResult;
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const handleChange = (name, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setError("");
    setSavedMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.visitedVet) {
      setError("Select whether you visited a vet.");
      return;
    }

    if (!formData.vetRecommendation.trim()) {
      setError("Enter what the vet recommended.");
      return;
    }

    if (!formData.triageCorrect) {
      setError("Select whether PetTriage was correct.");
      return;
    }

    await submitVetFeedback(formData);

    setSavedMessage("Feedback submitted for this session.");
    setError("");
    setFormData(initialFormData);
  };

  return (
    <main className="vet-feedback-page">
      <header className="feedback-header">
        <div className="feedback-header__actions">
          <button className="back-button" type="button" onClick={onNavigateResult}>
            Back Result
          </button>
          <button className="text-button" type="button" onClick={onNavigateHome}>
            Back Home
          </button>
        </div>

        <div>
          <p className="eyebrow">Vet Feedback</p>
          <h1>Share what happened after {mockProfile.petName}'s triage</h1>
          <p>
            Record the actual outcome so PetTriage recommendations can be
            compared with veterinary guidance.
          </p>
        </div>
      </header>

      <div className="feedback-layout">
        <aside className="feedback-summary" aria-label="Triage summary">
          <p className="eyebrow">Screening Summary</p>
          <h2>{result.urgency}</h2>
          <dl>
            <div>
              <dt>Pet</dt>
              <dd>{mockProfile.petName}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{result.confidenceLabel || `${result.confidence}%`}</dd>
            </div>
            <div>
              <dt>Recommended action</dt>
              <dd>{result.recommendedAction}</dd>
            </div>
          </dl>
        </aside>

        <section className="feedback-form-panel" aria-labelledby="feedback-form-title">
          <div className="feedback-form-panel__heading">
            <p className="eyebrow">Outcome</p>
            <h2 id="feedback-form-title">Vet outcome feedback</h2>
          </div>
          <VetFeedbackForm
            error={error}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            savedMessage={savedMessage}
          />
        </section>
      </div>
    </main>
  );
}
