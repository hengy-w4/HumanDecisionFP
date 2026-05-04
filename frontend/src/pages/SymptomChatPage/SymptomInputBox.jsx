export default function SymptomInputBox({
  value,
  onChange,
  onSubmit,
  isLoading,
}) {
  return (
    <form className="symptom-input" onSubmit={onSubmit}>
      <label htmlFor="symptoms">Describe symptoms</label>
      <textarea
        id="symptoms"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: Mochi has been vomiting, seems tired, and will not eat."
        rows="7"
      />
      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? "Checking..." : "Submit Symptoms"}
      </button>
    </form>
  );
}
