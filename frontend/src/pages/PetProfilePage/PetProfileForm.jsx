const speciesOptions = ["Dog", "Cat"];
const sexOptions = ["Female", "Male", "Unknown"];
const spayNeuterOptions = ["Spayed", "Neutered", "Intact", "Unknown"];
const vaccineOptions = ["Up to date", "Partially vaccinated", "Overdue", "Unknown"];

export default function PetProfileForm({
  formData,
  onChange,
  onSave,
  savedMessage,
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  return (
    <form className="pet-profile-form" onSubmit={onSave}>
      <div className="form-grid">
        <label>
          Pet name
          <input
            name="petName"
            value={formData.petName}
            onChange={handleInputChange}
            placeholder="Mochi"
          />
        </label>

        <label>
          Species
          <select
            name="species"
            value={formData.species}
            onChange={handleInputChange}
          >
            {speciesOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Breed
          <input
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="Corgi mix"
          />
        </label>

        <label>
          Age
          <input
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="5 years"
          />
        </label>

        <label>
          Weight
          <input
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="24 lb"
          />
        </label>

        <label>
          Sex
          <select name="sex" value={formData.sex} onChange={handleInputChange}>
            {sexOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Spayed/neutered
          <select
            name="spayedNeutered"
            value={formData.spayedNeutered}
            onChange={handleInputChange}
          >
            {spayNeuterOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Vaccination status
          <select
            name="vaccinationStatus"
            value={formData.vaccinationStatus}
            onChange={handleInputChange}
          >
            {vaccineOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="form-field-wide">
          Known conditions
          <textarea
            name="knownConditions"
            value={formData.knownConditions}
            onChange={handleInputChange}
            rows="4"
            placeholder="Seasonal allergies, sensitive stomach"
          />
        </label>

        <label className="form-field-wide">
          Medications
          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleInputChange}
            rows="4"
            placeholder="Monthly flea prevention"
          />
        </label>
      </div>

      <div className="form-actions">
        {savedMessage ? <p>{savedMessage}</p> : null}
        <button className="primary-button" type="submit">
          Save Profile
        </button>
      </div>
    </form>
  );
}
