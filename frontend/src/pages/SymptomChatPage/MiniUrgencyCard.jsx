const urgencyDetails = {
  Emergency: {
    className: "urgency-card urgency-card--emergency",
    label: "Emergency",
  },
  Urgent: {
    className: "urgency-card urgency-card--urgent",
    label: "Urgent",
  },
  Monitor: {
    className: "urgency-card urgency-card--monitor",
    label: "Monitor",
  },
};

export default function MiniUrgencyCard({ urgency, recommendedAction, confidence }) {
  const detail = urgencyDetails[urgency] || urgencyDetails.Monitor;

  return (
    <section className={detail.className} aria-label="Urgency result">
      <div>
        <p className="eyebrow">Urgency Result</p>
        <h2>{detail.label}</h2>
      </div>
      <p>{recommendedAction}</p>
      <div className="urgency-card__confidence">
        <span>Confidence</span>
        <strong>{confidence}%</strong>
      </div>
    </section>
  );
}
