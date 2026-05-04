const urgencyClassNames = {
  Emergency: "history-item__urgency history-item__urgency--emergency",
  Urgent: "history-item__urgency history-item__urgency--urgent",
  Monitor: "history-item__urgency history-item__urgency--monitor",
};

export default function ScreeningHistoryList({ screenings }) {
  return (
    <section className="history-section" aria-labelledby="history-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Screening History</p>
          <h2 id="history-title">Previous symptom checks</h2>
        </div>
        <button className="text-button" type="button">
          View all
        </button>
      </div>

      <div className="history-list">
        {screenings.map((screening) => (
          <article className="history-item" key={screening.id}>
            <div>
              <time>{screening.date}</time>
              <h3>{screening.summary}</h3>
              <p>{screening.action}</p>
            </div>
            <span className={urgencyClassNames[screening.urgency]}>
              {screening.urgency}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
