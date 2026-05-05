import { useEffect, useRef, useState } from "react";

const urgencyClassNames = {
  Emergency: "history-item__urgency history-item__urgency--emergency",
  Urgent: "history-item__urgency history-item__urgency--urgent",
  Monitor: "history-item__urgency history-item__urgency--monitor",
};

export default function ScreeningHistoryList({ screenings }) {
  const historySectionRef = useRef(null);
  const [selectedScreeningId, setSelectedScreeningId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const visibleScreenings = showAll ? screenings : screenings.slice(0, 3);
  const selectedScreening =
    screenings.find((screening) => screening.id === selectedScreeningId) || null;

  const handleToggleVisible = () => {
    setShowAll((currentShowAll) => {
      const nextShowAll = !currentShowAll;

      if (currentShowAll) {
        const selectedWillRemainVisible = screenings
          .slice(0, 3)
          .some((screening) => screening.id === selectedScreeningId);

        if (!selectedWillRemainVisible) {
          setSelectedScreeningId(null);
        }
      }

      return nextShowAll;
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!historySectionRef.current?.contains(event.target)) {
        setSelectedScreeningId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <section
      className="history-section"
      aria-labelledby="history-title"
      ref={historySectionRef}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Screening History</p>
          <h2 id="history-title">Previous symptom checks</h2>
        </div>
        <button className="text-button" type="button" onClick={handleToggleVisible}>
          {showAll ? "Show less" : "Show all"}
        </button>
      </div>

      <div className="history-list">
        {visibleScreenings.map((screening) => (
          <div className="history-entry" key={screening.id}>
            <button
              aria-label={`Open screening details for ${screening.summary}`}
              className={
                selectedScreening?.id === screening.id
                  ? "history-item history-item--active"
                  : "history-item"
              }
              onClick={() => setSelectedScreeningId(screening.id)}
              type="button"
            >
              <span className="history-item__content">
                <time>{screening.date}</time>
                <span className="history-item__title">{screening.summary}</span>
                <span className="history-item__action">{screening.action}</span>
              </span>
              <span className={urgencyClassNames[screening.urgency]}>
                {screening.urgency}
              </span>
            </button>

            {selectedScreening?.id === screening.id ? (
              <section
                aria-label={`Opened screening details for ${screening.summary}`}
                className="history-detail"
                id={`screening-panel-${screening.id}`}
              >
                <div className="history-detail__header">
                  <div>
                    <p className="eyebrow">Opened Screening</p>
                    <h3>{screening.summary}</h3>
                  </div>
                  <span className={urgencyClassNames[screening.urgency]}>
                    {screening.urgency}
                  </span>
                </div>

                <dl className="history-detail__grid">
                  <div>
                    <dt>Date</dt>
                    <dd>{screening.date}</dd>
                  </div>
                  <div>
                    <dt>Recommended action</dt>
                    <dd>{screening.action}</dd>
                  </div>
                  <div>
                    <dt>Reasoning</dt>
                    <dd>{screening.reasoning}</dd>
                  </div>
                  <div>
                    <dt>Red flags</dt>
                    <dd>
                      {screening.redFlags.length > 0
                        ? screening.redFlags.join(", ")
                        : "None detected"}
                    </dd>
                  </div>
                  <div className="history-detail__wide">
                    <dt>Follow-up note</dt>
                    <dd>{screening.followUp}</dd>
                  </div>
                </dl>
              </section>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
