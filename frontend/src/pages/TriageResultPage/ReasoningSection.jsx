export default function ReasoningSection({ result }) {
  return (
    <section className="result-section" aria-labelledby="reasoning-title">
      <div className="result-section__heading">
        <p className="eyebrow">Clinical Reasoning</p>
        <h2 id="reasoning-title">Why PetTriage chose this level</h2>
      </div>

      <div className="reasoning-layout">
        <div className="reasoning-copy">
          <h3>Assessment</h3>
          <p>{result.reasoning}</p>
        </div>

        <div className="reasoning-copy">
          <h3>Clarifying question</h3>
          <p>{result.clarifyingQuestion}</p>
        </div>
      </div>

      <div className="red-flag-panel">
        <h3>Red flags detected</h3>
        {result.redFlags.length > 0 ? (
          <ul>
            {result.redFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        ) : (
          <p>No emergency red flags were detected in the submitted symptoms.</p>
        )}
      </div>
    </section>
  );
}
