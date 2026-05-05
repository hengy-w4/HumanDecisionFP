import MiniUrgencyCard from "./MiniUrgencyCard.jsx";

export default function ChatbotResponseArea({ result, onViewResult }) {
  if (!result) {
    return (
      <section className="chat-response chat-response--empty">
        <p className="eyebrow">Chatbot Response</p>
        <h2>Ready when you are</h2>
        <p>
          Enter a symptom description and PetTriage will summarize likely
          urgency, reasoning, red flags, and a recommended next step.
        </p>
      </section>
    );
  }

  return (
    <section className="chat-response" aria-labelledby="response-title">
      <div className="chat-response__header">
        <div>
          <p className="eyebrow">Chatbot Response</p>
          <h2 id="response-title">Triage summary</h2>
        </div>
        <span>{result.timestamp}</span>
      </div>

      <MiniUrgencyCard
        urgency={result.urgency}
        recommendedAction={result.recommendedAction}
        confidence={result.confidence}
      />

      <div className="response-grid">
        <section>
          <h3>Reasoning</h3>
          <p>{result.reasoning}</p>
        </section>

        <section>
          <h3>Red flags detected</h3>
          {result.redFlags.length > 0 ? (
            <ul>
              {result.redFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          ) : (
            <p>No red flags detected from the submitted text.</p>
          )}
        </section>

        <section>
          <h3>Recommended action</h3>
          <p>{result.recommendedAction}</p>
        </section>

        <section>
          <h3>Clarifying question</h3>
          <p>{result.clarifyingQuestion}</p>
        </section>
      </div>

      <button className="primary-button response-action" type="button" onClick={onViewResult}>
        View Full Result
      </button>
    </section>
  );
}
