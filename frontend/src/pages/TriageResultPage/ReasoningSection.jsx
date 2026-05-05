export default function ReasoningSection({ result }) {
  const hasRedFlags = result.redFlags.length > 0;

  return (
    <section className="result-section" aria-labelledby="reasoning-title">
      <div className="result-section__heading">
        <p className="eyebrow">Clinical Reasoning</p>
        <h2 id="reasoning-title">Why PetTriage chose this level</h2>
      </div>

      <div className="reasoning-layout reasoning-layout--single">
        <div className="reasoning-copy">
          <h3>Assessment</h3>
          <p>{result.reasoning}</p>
        </div>
      </div>

      <div className="red-flag-panel">
        <h3>Red flags detected</h3>
        {hasRedFlags ? (
          <ul>
            {result.redFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        ) : result.urgency === "Emergency" ? (
          <p>Emergency-level symptoms were identified in the triage assessment.</p>
        ) : (
          <p>No emergency red flags were detected in the submitted symptoms.</p>
        )}
      </div>
    </section>
  );
}
