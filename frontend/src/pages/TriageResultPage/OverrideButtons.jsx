const overrideOptions = [
  {
    label: "This seems more serious",
    value: "You marked this result as more serious.",
  },
  {
    label: "This seems less serious",
    value: "You marked this result as less serious.",
  },
  {
    label: "I am not sure",
    value: "You marked this result as uncertain.",
  },
];

export default function OverrideButtons({ note, onOverride }) {
  return (
    <section className="override-panel" aria-labelledby="override-title">
      <div>
        <p className="eyebrow">Review</p>
        <h2 id="override-title">Does this recommendation feel right?</h2>
        <p>
          Use these buttons if your judgement of the situation differs from the
          triage recommendation.
        </p>
      </div>

      <div className="override-buttons" role="group" aria-label="Result review">
        {overrideOptions.map((option) => (
          <button
            className="text-button"
            type="button"
            key={option.value}
            onClick={() => onOverride(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {note ? <p className="override-note">{note}</p> : null}
    </section>
  );
}
