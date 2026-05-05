const urgencyContent = {
  Emergency: {
    className: "result-urgency result-urgency--emergency",
    label: "Emergency",
    timeline: "Go now",
  },
  Urgent: {
    className: "result-urgency result-urgency--urgent",
    label: "Urgent",
    timeline: "Contact your vet today",
  },
  Monitor: {
    className: "result-urgency result-urgency--monitor",
    label: "Monitor",
    timeline: "Watch closely",
  },
};

export default function UrgencyResultCard({ result }) {
  const detail = urgencyContent[result.urgency] || urgencyContent.Monitor;

  return (
    <section className={detail.className} aria-labelledby="urgency-result-title">
      <div className="result-urgency__main">
        <p className="eyebrow">Urgency Result</p>
        <h2 id="urgency-result-title">{detail.label}</h2>
        <p>{result.recommendedAction}</p>
      </div>

      <div className="result-urgency__metrics" aria-label="Result details">
        <div>
          <span>Confidence</span>
          <strong>{result.confidence}%</strong>
        </div>
        <div>
          <span>Timeline</span>
          <strong>{result.timeline || detail.timeline}</strong>
        </div>
      </div>
    </section>
  );
}
