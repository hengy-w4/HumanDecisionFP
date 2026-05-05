const vetVisitOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const correctnessOptions = [
  { label: "Yes", value: "yes" },
  { label: "Partially", value: "partially" },
  { label: "No", value: "no" },
  { label: "Not sure", value: "not_sure" },
];

export default function VetFeedbackForm({
  formData,
  onChange,
  onSubmit,
  error,
  savedMessage,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <form className="vet-feedback-form" onSubmit={onSubmit}>
      <fieldset>
        <legend>Did you visit a vet?</legend>
        <div className="segmented-options">
          {vetVisitOptions.map((option) => (
            <label key={option.value}>
              <input
                checked={formData.visitedVet === option.value}
                name="visitedVet"
                onChange={handleChange}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        What did the vet recommend?
        <textarea
          name="vetRecommendation"
          onChange={handleChange}
          placeholder="Example: Monitor overnight, bland diet, fluids, medication, follow-up appointment..."
          rows="4"
          value={formData.vetRecommendation}
        />
      </label>

      <fieldset>
        <legend>Was PetTriage correct?</legend>
        <div className="segmented-options segmented-options--four">
          {correctnessOptions.map((option) => (
            <label key={option.value}>
              <input
                checked={formData.triageCorrect === option.value}
                name="triageCorrect"
                onChange={handleChange}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        Actual diagnosis or vet notes optional
        <textarea
          name="vetNotes"
          onChange={handleChange}
          placeholder="Optional diagnosis, exam notes, medications, or follow-up details"
          rows="4"
          value={formData.vetNotes}
        />
      </label>

      <label>
        Additional comments
        <textarea
          name="additionalComments"
          onChange={handleChange}
          placeholder="Anything else that would help evaluate the triage recommendation"
          rows="4"
          value={formData.additionalComments}
        />
      </label>

      {error ? <p className="feedback-error">{error}</p> : null}

      <div className="feedback-form-actions">
        {savedMessage ? <p>{savedMessage}</p> : null}
        <button className="primary-button" type="submit">
          Submit Feedback
        </button>
      </div>
    </form>
  );
}
