import { useState } from "react";
import { mockProfile } from "../../data/mockProfile.js";
import { mockTriageResult } from "../../data/mockTriageResult.js";
import OverrideButtons from "./OverrideButtons.jsx";
import ReasoningSection from "./ReasoningSection.jsx";
import UrgencyResultCard from "./UrgencyResultCard.jsx";
import "./triageResultPage.css";

export default function TriageResultPage({
  result,
  onNavigateChat,
  onNavigateHome,
  onNavigateFeedback,
}) {
  const activeResult = result || mockTriageResult;
  const [overrideNote, setOverrideNote] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleFeedbackClick = () => {
    if (onNavigateFeedback) {
      onNavigateFeedback();
      return;
    }

    setFeedbackMessage("Feedback form will be connected when VetFeedbackPage is ready.");
  };

  return (
    <main className="triage-result-page">
      <header className="result-header">
        <div className="result-header__actions">
          <button className="back-button" type="button" onClick={onNavigateHome}>
            Back Home
          </button>
          <button className="text-button" type="button" onClick={onNavigateChat}>
            New Check
          </button>
        </div>

        <div>
          <p className="eyebrow">Triage Result</p>
          <h1>{mockProfile.petName}'s final urgency recommendation</h1>
          <p>
            Review the recommendation from the symptom check and decide whether
            the urgency level matches what you are seeing.
          </p>
        </div>
      </header>

      <div className="result-layout">
        <div className="result-main">
          <UrgencyResultCard result={activeResult} />
          <ReasoningSection result={activeResult} />
        </div>

        <aside className="result-sidebar" aria-label="Screening context">
          <section className="result-context">
            <p className="eyebrow">Submitted Symptoms</p>
            <h2>What was checked</h2>
            <p>{activeResult.symptoms || "Symptom description from the latest chat."}</p>
            <span>{activeResult.timestamp || "Just now"}</span>
          </section>

          <section className="result-context">
            <p className="eyebrow">Pet Context</p>
            <h2>{mockProfile.petName}</h2>
            <dl>
              <div>
                <dt>Species</dt>
                <dd>{mockProfile.species}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{mockProfile.age}</dd>
              </div>
              <div>
                <dt>Known conditions</dt>
                <dd>{mockProfile.knownConditions.join(", ")}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <section className="next-step-panel" aria-labelledby="next-step-title">
        <div className="result-section__heading">
          <p className="eyebrow">Recommended Next Step</p>
          <h2 id="next-step-title">What to do now</h2>
        </div>
        <p>{activeResult.recommendedAction}</p>
      </section>

      <OverrideButtons note={overrideNote} onOverride={setOverrideNote} />

      <section className="feedback-panel" aria-labelledby="feedback-title">
        <div>
          <p className="eyebrow">Vet Feedback</p>
          <h2 id="feedback-title">Share the real outcome later</h2>
          <p>
            After a vet visit or monitoring period, feedback helps compare this
            recommendation with what actually happened.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={handleFeedbackClick}>
          Go to Feedback Form
        </button>
        {feedbackMessage ? <p className="feedback-message">{feedbackMessage}</p> : null}
      </section>

      <section className="result-disclaimer" aria-labelledby="disclaimer-title">
        <p className="eyebrow">Safety Disclaimer</p>
        <h2 id="disclaimer-title">PetTriage is not a diagnosis</h2>
        <p>
          This recommendation does not replace veterinary care. If symptoms are
          severe, rapidly worsening, or you are worried, contact a veterinarian
          or emergency clinic immediately.
        </p>
      </section>
    </main>
  );
}
